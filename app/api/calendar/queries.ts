"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { Events } from "@/lib/types"
import { headers } from "next/headers"
import { OAuth2Client } from "google-auth-library"
import { google } from "googleapis"

async function authenticate() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

async function getGoogleAuthClient(userId: string) {
    const userToken = await prisma.account.findFirst({
        where: {
            userId: userId,
            providerId: "google",
        },
        select: {
            refreshToken: true,
        },
    })

    const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    )

    oauth2Client.setCredentials({
        refresh_token: userToken?.refreshToken,
    })

    const { credentials } = await oauth2Client.refreshAccessToken()

    oauth2Client.setCredentials(credentials)

    return oauth2Client
}

export async function getCalendarEvents(): Promise<Events[]> {
    const user = await authenticate()
    if (!user) throw new Error("Unauthorized")

    const results = await google.calendar("v3").events.list({
        auth: await getGoogleAuthClient(user.id),
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
    colorId,
}: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    colorId?: string
}) {
    const user = await authenticate()
    if (!user) throw new Error("Unauthorized")
    try {
        const result = await google.calendar("v3").events.insert({
            auth: await getGoogleAuthClient(user.id),
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
                colorId: colorId || "7",
            },
        })
        return result.data
    } catch (error) {
        console.error("Error creating calendar event:", error)
        throw error
    }
}

export async function deleteCalendarEvent(eventId: string) {
    const user = await authenticate()
    if (!user) throw new Error("Unauthorized")
    try {
        await google.calendar("v3").events.delete({
            auth: await getGoogleAuthClient(user.id),
            calendarId: "primary",
            eventId: eventId,
        })
        return true
    } catch (error) {
        console.error("Error deleting calendar event:", error)
        return false
    }
}
