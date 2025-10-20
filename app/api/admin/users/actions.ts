"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireAdminSession } from "@/app/api/admin/utils"

export async function verifyUserAction(formData: FormData) {
    await requireAdminSession()
    const userId = formData.get("userId")

    if (typeof userId !== "string" || userId.length === 0) {
        throw new Error("Missing userId")
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            userVerified: true,
            banned: false,
        },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/users")
}

export async function unverifyUserAction(formData: FormData) {
    await requireAdminSession()
    const userId = formData.get("userId")

    if (typeof userId !== "string" || userId.length === 0) {
        throw new Error("Missing userId")
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            userVerified: false,
        },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/users")
}

export async function deleteUserAction(formData: FormData) {
    await requireAdminSession()
    const userId = formData.get("userId")

    if (typeof userId !== "string" || userId.length === 0) {
        throw new Error("Missing userId")
    }

    await prisma.user.delete({
        where: { id: userId },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    revalidatePath("/admin/departments")
}

export async function deleteMultipleUsersAction(userIds: string[]) {
    await requireAdminSession()

    if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error("Missing userIds")
    }

    await prisma.user.deleteMany({
        where: {
            id: {
                in: userIds,
            },
        },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    revalidatePath("/admin/departments")
}

export async function updateUserAction(formData: FormData) {
    await requireAdminSession()
    const userId = formData.get("userId")
    const name = formData.get("name")
    const displayName = formData.get("displayName")
    const email = formData.get("email")
    const role = formData.get("role")
    const departmentId = formData.get("departmentId")

    if (typeof userId !== "string" || userId.length === 0) {
        throw new Error("Missing userId")
    }

    const updateData: {
        name?: string
        displayName?: string
        email?: string
        role?: string
        departmentId?: string | null
    } = {}

    if (typeof name === "string" && name.length > 0) {
        updateData.name = name
    }
    if (typeof displayName === "string") {
        updateData.displayName = displayName
    }
    if (typeof email === "string" && email.length > 0) {
        updateData.email = email
    }
    if (typeof role === "string" && role.length > 0) {
        updateData.role = role
    }
    if (departmentId === null || departmentId === "") {
        updateData.departmentId = null
    } else if (typeof departmentId === "string" && departmentId.length > 0) {
        updateData.departmentId = departmentId
    }

    await prisma.user.update({
        where: { id: userId },
        data: updateData,
    })

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    revalidatePath("/admin/departments")
}
