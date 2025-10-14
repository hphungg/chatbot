"use server"

import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { sendInviteEmail } from "@/lib/email/send-invite"
import { requireAdminSession } from "@/app/api/admin/utils"

export interface AdminUserRecord {
    id: string
    name: string
    email: string
    displayName: string | null
    role: string
    departmentId: string | null
    departmentName: string | null
    userVerified: boolean
    emailVerified: boolean
}

export interface AdminDepartmentRecord {
    id: string
    name: string
}

const updateAdminUserSchema = z.object({
    id: z.string().min(1),
    displayName: z.string().trim().min(1).optional(),
    role: z.string().trim().min(1).optional(),
    departmentId: z.string().trim().min(1).optional().nullable(),
})

const inviteUserSchema = z.object({
    email: z.string().trim().email(),
    role: z.string().trim().min(1),
})

function mapUserRecord(user: {
    id: string
    name: string
    email: string
    displayName: string | null
    role: string
    userVerified: boolean
    emailVerified: boolean
    department: { id: string; name: string } | null
}): AdminUserRecord {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        departmentId: user.department ? user.department.id : null,
        departmentName: user.department ? user.department.name : null,
        userVerified: user.userVerified,
        emailVerified: user.emailVerified,
    }
}

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
    await requireAdminSession()
    const users = await prisma.user.findMany({
        include: {
            department: {
                select: { id: true, name: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })
    return users.map((user) =>
        mapUserRecord({
            id: user.id,
            name: user.name,
            email: user.email,
            displayName: user.displayName ?? null,
            role: user.role,
            userVerified: user.userVerified,
            emailVerified: user.emailVerified,
            department: user.department
                ? { id: user.department.id, name: user.department.name }
                : null,
        }),
    )
}

export async function getAdminDepartments(): Promise<AdminDepartmentRecord[]> {
    await requireAdminSession()
    const departments = await prisma.department.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    })
    return departments.map((department) => ({
        id: department.id,
        name: department.name,
    }))
}

export async function updateAdminUser(
    payload: unknown,
): Promise<AdminUserRecord> {
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
    return mapUserRecord({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        displayName: updated.displayName ?? null,
        role: updated.role,
        userVerified: updated.userVerified,
        emailVerified: updated.emailVerified,
        department: updated.department
            ? { id: updated.department.id, name: updated.department.name }
            : null,
    })
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
    const baseUrl =
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.VERCEL_URL ||
        "http://localhost:3000"
    const inviteLink = new URL(
        "/sign-in",
        baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`,
    )
    await sendInviteEmail({
        email: normalizedEmail,
        inviteLink: inviteLink.toString(),
        inviterName: adminSession.user.name ?? "",
        role: parsed.role,
    })
}
