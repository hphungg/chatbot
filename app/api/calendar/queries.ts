"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { Events } from "@/lib/types"
import { google } from "googleapis"
import { headers } from "next/headers"

async function getAuthenticatedToken() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    const user = session.user

    const userToken = await prisma.account.findFirst({
        where: {
            userId: user.id,
            providerId: "google",
        },
        select: {
            accessToken: true,
        },
    })

    return userToken?.accessToken
}

async function getGoogleAuthClient() {
    const token = await getAuthenticatedToken()
    if (!token) throw new Error("Unauthorized")

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    )

    oauth2Client.setCredentials({
        access_token: token,
    })

    return oauth2Client
}

export async function getCalendarEvents(): Promise<Events[]> {
    const oauth2Client = await getGoogleAuthClient()
    const results = await google.calendar("v3").events.list({
        auth: oauth2Client,
        calendarId: "primary",
        eventTypes: ["default"],
        singleEvents: true,
    })

    const events: Events[] =
        results.data.items?.map((event) => ({
            id: event.id || "",
            title: event.summary || "Unknown",
            creator: event.creator?.email || "Unknown",
            start: event.start?.dateTime || event.start?.date || "",
            end: event.end?.dateTime || event.end?.date || "",
            eventType: event.eventType || "default",
            colorId: event.colorId ? parseInt(event.colorId) : 0,
        })) || []

    return events.sort((a, b) => {
        const dateA = new Date(a.start).getTime()
        const dateB = new Date(b.start).getTime()
        return dateA - dateB
    })
}

export async function createCalendarEvent({
    title,
    description,
    startTime,
    endTime,
}: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
}) {
    try {
        const oauth2Client = await getGoogleAuthClient()
        const result = await google.calendar("v3").events.insert({
            auth: oauth2Client,
            calendarId: "primary",
            requestBody: {
                summary: title,
                description: description,
                start: {
                    dateTime: startTime.toISOString(),
                },
                end: {
                    dateTime: endTime.toISOString(),
                },
            },
        })
        return result.data
    } catch (error) {
        console.error("Error creating calendar event:", error)
        throw error
    }
}
