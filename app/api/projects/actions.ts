"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function authenticate() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

function parseDate(value: string | null): Date | null {
    if (!value) {
        return null
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid date")
    }
    return parsed
}

export async function createProjectForManager({
    name,
    startDate,
    endDate,
}: {
    name: string
    startDate: string | null
    endDate: string | null
}) {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")
    if (user.role !== "manager") {
        throw new Error("Chỉ quản lý mới có thể tạo dự án")
    }

    const manager = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            managedDepartments: true,
        },
    })

    if (!manager || manager.managedDepartments.length === 0) {
        throw new Error("Bạn không quản lý phòng ban nào")
    }

    const departmentId = manager.managedDepartments[0].id

    if (!name) {
        throw new Error("Tên dự án là bắt buộc")
    }

    try {
        const project = await prisma.project.create({
            data: {
                name,
                startDate: parseDate(startDate),
                endDate: parseDate(endDate),
            },
        })

        await prisma.projectDepartment.create({
            data: {
                projectId: project.id,
                departmentId: departmentId,
            },
        })

        revalidatePath("/projects")

        return project
    } catch (error) {
        throw new Error("Lỗi khi tạo dự án: " + (error as Error).message)
    }
}

export async function deleteProjects(projectIds: string[]) {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")
    if (user.role !== "admin") {
        throw new Error("Chỉ admin mới có thể xóa dự án")
    }

    if (!projectIds || projectIds.length === 0) {
        throw new Error("Không có dự án nào được chọn")
    }

    try {
        await prisma.project.deleteMany({
            where: {
                id: {
                    in: projectIds,
                },
            },
        })

        revalidatePath("/admin/projects")

        return { success: true }
    } catch (error) {
        throw new Error("Lỗi khi xóa dự án: " + (error as Error).message)
    }
}
