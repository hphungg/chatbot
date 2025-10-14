import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { inviteUser } from "@/app/api/admin/queries"

function resolveStatus(message: string): number {
    if (message === "Unauthorized") return 401
    if (message === "Forbidden") return 403
    if (message === "Email already registered") return 409
    if (message === "Missing invite sender address") return 500
    if (message === "Missing RESEND_API_KEY") return 500
    return 500
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        await inviteUser(body)
        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0]?.message ?? "Invalid payload" },
                { status: 400 },
            )
        }
        const message =
            error instanceof Error ? error.message : "Failed to send invite"
        return NextResponse.json(
            { error: message },
            { status: resolveStatus(message) },
        )
    }
}
