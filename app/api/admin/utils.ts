"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export interface AdminSessionUser {
    id: string
    role: string
    name: string | null
    email: string | null
}

export interface AdminSession {
    user: AdminSessionUser
}

export async function requireAdminSession(): Promise<AdminSession> {
    const headerList = await headers()
    const session = await auth.api.getSession({
        headers: headerList,
    })

    if (!session) {
        throw new Error("Unauthorized")
    }

    const { user } = session as { user: Record<string, unknown> }
    const role = typeof user.role === "string" ? user.role : ""

    if (role !== "admin") {
        throw new Error("Forbidden")
    }

    const id = typeof user.id === "string" ? user.id : ""

    if (!id) {
        throw new Error("Unauthorized")
    }

    const name = typeof user.name === "string" ? user.name : null
    const email = typeof user.email === "string" ? user.email : null

    return {
        user: {
            id,
            role,
            name,
            email,
        },
    }
}
