"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { User } from "@prisma/client"
import { headers } from "next/headers"

async function authenticate() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

export const getAllUsers = async (): Promise<User[]> => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")

    try {
        const users = await prisma.user.findMany({
            include: {
                department: true,
            },
        })
        return users
    } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch users")
    }
}

export const deleteUsers = async (userIds: string[]) => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")

    try {
        await prisma.user.deleteMany({
            where: {
                id: { in: userIds },
            },
        })
    } catch (error) {
        console.error(error)
        throw new Error("Failed to delete users")
    }
    return true
}

export const updateCurrentUserDisplayName = async (displayName: string) => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")

    const nextDisplayName = displayName.trim()

    if (!nextDisplayName) {
        throw new Error("Display name is required")
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { displayName: nextDisplayName },
        })
    } catch (error) {
        console.error(error)
        throw new Error("Failed to update display name")
    }

    return nextDisplayName
}
