"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireAdminSession } from "@/app/api/admin/utils"

interface ProjectInput {
    name: string
    departmentId: string | null
    startDate: string | null
    endDate: string | null
}

interface ProjectUpdateInput extends ProjectInput {
    projectId: string
}

interface SerializedProject {
    id: string
    name: string
    departmentId: string | null
    departmentName: string | null
    startDate: string | null
    endDate: string | null
    memberCount: number
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

function serializeProject(project: {
    id: string
    name: string
    departmentId: string | null
    department: { name: string | null } | null
    startDate: Date | null
    endDate: Date | null
    _count: { users: number }
}): SerializedProject {
    return {
        id: project.id,
        name: project.name,
        departmentId: project.departmentId,
        departmentName: project.department?.name ?? null,
        startDate: project.startDate ? project.startDate.toISOString() : null,
        endDate: project.endDate ? project.endDate.toISOString() : null,
        memberCount: project._count.users,
    }
}

function normalizeInput(input: ProjectInput): ProjectInput {
    return {
        name: input.name.trim(),
        departmentId: input.departmentId || null,
        startDate:
            input.startDate && input.startDate.length ? input.startDate : null,
        endDate: input.endDate && input.endDate.length ? input.endDate : null,
    }
}

function revalidateProjectPaths() {
    revalidatePath("/admin/projects")
    revalidatePath("/admin")
    revalidatePath("/dashboard/projects")
}

export async function createProjectAdmin({
    name,
    departmentId,
    startDate,
    endDate,
}: {
    name: string
    departmentId: string[]
    startDate: string | null
    endDate: string | null
}) {
    await requireAdminSession()
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

        if (departmentId && departmentId.length > 0) {
            for (const depId of departmentId) {
                await prisma.projectDepartment.create({
                    data: {
                        projectId: project.id,
                        departmentId: depId,
                    },
                })
            }
        }

        revalidateProjectPaths()

        return project
    } catch (error) {
        throw new Error("Lỗi khi tạo dự án: " + (error as Error).message)
    }
}

export async function deleteProjectAction(projectId: string) {
    await requireAdminSession()
    if (!projectId) {
        throw new Error("Thiếu mã dự án")
    }

    await prisma.project.delete({
        where: { id: projectId },
    })

    revalidateProjectPaths()

    return { projectId }
}
