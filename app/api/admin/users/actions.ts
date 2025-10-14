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
