import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { updateAdminUser } from "@/app/api/admin/queries"

function resolveStatus(message: string): number {
    if (message === "Unauthorized") return 401
    if (message === "Forbidden") return 403
    if (message === "Department not found") return 404
    if (message === "Email already registered") return 409
    return 500
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const user = await updateAdminUser(body)
        return NextResponse.json({ user })
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0]?.message ?? "Invalid payload" },
                { status: 400 },
            )
        }
        const message =
            error instanceof Error ? error.message : "Failed to update user"
        return NextResponse.json(
            { error: message },
            { status: resolveStatus(message) },
        )
    }
}
