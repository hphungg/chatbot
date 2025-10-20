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

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            managedDepartments: true,
        },
    })

    if (!currentUser) {
        return { error: "User not found" }
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

    const newDepartmentId =
        departmentId === null || departmentId === ""
            ? null
            : typeof departmentId === "string" && departmentId.length > 0
              ? departmentId
              : currentUser.departmentId

    const oldRole = currentUser.role
    const newRole = typeof role === "string" && role.length > 0 ? role : oldRole

    const isCurrentlyManager = currentUser.managedDepartments.length > 0

    if (isCurrentlyManager && newDepartmentId !== currentUser.departmentId) {
        return { error: "Quản lý không thể thay đổi phòng ban của mình" }
    }

    if (oldRole !== "manager" && newRole === "manager") {
        if (!newDepartmentId) {
            return { error: "Quản lý phải được chỉ định một phòng ban" }
        }

        const department = await prisma.department.findUnique({
            where: { id: newDepartmentId },
            select: { managerId: true },
        })

        if (!department) {
            return { error: "Phòng ban không tồn tại" }
        }

        if (department.managerId && department.managerId !== userId) {
            return { error: "Phòng ban đã có quản lý" }
        }

        await prisma.department.update({
            where: { id: newDepartmentId },
            data: { managerId: userId },
        })

        updateData.role = newRole
        updateData.departmentId = newDepartmentId
    } else if (oldRole === "manager" && newRole !== "manager") {
        if (currentUser.managedDepartments.length > 0) {
            await prisma.department.update({
                where: { id: currentUser.managedDepartments[0].id },
                data: { managerId: null },
            })
        }

        updateData.role = newRole
        if (newDepartmentId !== undefined) {
            updateData.departmentId = newDepartmentId
        }
    } else {
        if (typeof role === "string" && role.length > 0) {
            updateData.role = role
        }
        if (newDepartmentId !== currentUser.departmentId) {
            updateData.departmentId = newDepartmentId
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: updateData,
    })

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    revalidatePath("/admin/departments")

    return { error: null }
}
