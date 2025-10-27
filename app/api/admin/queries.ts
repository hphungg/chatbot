"use server"

import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { sendInviteEmail } from "@/lib/email/send-invite"
import { requireAdminSession } from "@/app/api/admin/utils"
import { Department, User } from "@prisma/client"

const updateAdminUserSchema = z.object({
    id: z.string().min(1),
    displayName: z.string().trim().min(1).optional(),
    role: z.string().trim().min(1).optional(),
    departmentId: z.string().trim().min(1).optional().nullable(),
})

const inviteUserSchema = z.object({
    email: z.string().trim().email(),
})

export async function getAdminUsers(): Promise<User[]> {
    await requireAdminSession()
    const users = await prisma.user.findMany({
        include: {
            department: true,
        },
        orderBy: { createdAt: "desc" },
    })
    return users
}

export async function getAdminDepartments(): Promise<Department[]> {
    await requireAdminSession()
    const departments = await prisma.department.findMany({
        orderBy: { name: "asc" },
    })
    return departments
}

export async function updateAdminUser(payload: unknown): Promise<User> {
    await requireAdminSession()
    const parsed = updateAdminUserSchema.parse(payload)
    const departmentId = parsed.departmentId ?? null
    if (departmentId) {
        const departmentExists = await prisma.department.findUnique({
            where: { id: departmentId },
            select: { id: true },
        })
        if (!departmentExists) {
            throw new Error("Department not found")
        }
    }
    const updated = await prisma.user.update({
        where: { id: parsed.id },
        data: {
            displayName: parsed.displayName,
            role: parsed.role,
            departmentId,
        },
        include: {
            department: {
                select: { id: true, name: true },
            },
        },
    })
    return updated
}

export async function inviteUser(payload: unknown): Promise<void> {
    const adminSession = await requireAdminSession()
    const parsed = inviteUserSchema.parse(payload)
    const normalizedEmail = parsed.email.toLowerCase()
    const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
    })
    if (existing) {
        throw new Error("Email already registered")
    }
    await prisma.invitedUser.upsert({
        where: { email: normalizedEmail },
        update: {
            invitedBy: adminSession.user.id,
        },
        create: {
            email: normalizedEmail,
            invitedBy: adminSession.user.id,
        },
    })
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const inviteLink = new URL(
        "/sign-in",
        baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`,
    )
    await sendInviteEmail({
        email: normalizedEmail,
        inviteLink: inviteLink.toString(),
    })
}
