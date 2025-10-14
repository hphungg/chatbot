"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { requireAdminSession } from "@/app/api/admin/utils"

interface DepartmentInput {
    name: string
    code: string
}

interface DepartmentUpdateInput extends DepartmentInput {
    departmentId: string
}

export interface SerializedDepartment {
    id: string
    name: string
    code: string
    employeeCount: number
    projectCount: number
}

function normalizeDepartmentInput(input: DepartmentInput): DepartmentInput {
    return {
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
    }
}

function serializeDepartment(department: {
    id: string
    name: string
    code: string
    _count: { users: number; projects: number }
}): SerializedDepartment {
    return {
        id: department.id,
        name: department.name,
        code: department.code,
        employeeCount: department._count.users,
        projectCount: department._count.projects,
    }
}

function revalidateDepartmentPaths() {
    revalidatePath("/admin/departments")
    revalidatePath("/admin")
    revalidatePath("/dashboard/departments")
}

function ensureValidInput(input: DepartmentInput) {
    if (!input.name) {
        throw new Error("Tên phòng ban là bắt buộc")
    }
    if (!input.code) {
        throw new Error("Mã phòng ban là bắt buộc")
    }
}

function handlePrismaError(error: unknown): never {
    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    ) {
        throw new Error("Mã phòng ban đã tồn tại")
    }
    throw error
}

export async function createDepartmentAction(input: DepartmentInput) {
    await requireAdminSession()
    const normalized = normalizeDepartmentInput(input)
    ensureValidInput(normalized)

    try {
        const department = await prisma.department.create({
            data: {
                name: normalized.name,
                code: normalized.code,
            },
            include: {
                _count: {
                    select: { users: true, projects: true },
                },
            },
        })

        const serialized = serializeDepartment(department)
        revalidateDepartmentPaths()

        return { department: serialized }
    } catch (error) {
        return handlePrismaError(error)
    }
}

export async function updateDepartmentAction(input: DepartmentUpdateInput) {
    await requireAdminSession()
    if (!input.departmentId) {
        throw new Error("Thiếu mã phòng ban")
    }
    const normalized = normalizeDepartmentInput(input)
    ensureValidInput(normalized)

    try {
        const department = await prisma.department.update({
            where: { id: input.departmentId },
            data: {
                name: normalized.name,
                code: normalized.code,
            },
            include: {
                _count: {
                    select: { users: true, projects: true },
                },
            },
        })

        const serialized = serializeDepartment(department)
        revalidateDepartmentPaths()

        return { department: serialized }
    } catch (error) {
        return handlePrismaError(error)
    }
}
