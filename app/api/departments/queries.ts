"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { headers } from "next/headers"
import { Department } from "@prisma/client"

async function authenticate() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

export const getAllDepartments = async (): Promise<Department[]> => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")

    try {
        const result = await prisma.department.findMany({
            include: {
                _count: {
                    select: { users: true, projects: true },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        const departments: Department[] = result.map((dept) => ({
            id: dept.id,
            name: dept.name,
            code: dept.code,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
            employeeCount: dept._count.users,
            projectCount: dept._count.projects,
        }))

        return departments
    } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch departments")
    }
}

export const deleteDepartments = async (departmentIds: string[]) => {
    const user = await authenticate()
    if (!user) throw new Error("Unauthorized")

    try {
        await prisma.department.deleteMany({
            where: {
                id: { in: departmentIds },
            },
        })
    } catch (error) {
        console.error(error)
        throw new Error("Failed to delete departments")
    }
    return true
}

export const createDepartment = async (departmentData: {
    name: string
    code: string
    selectedEmployees?: string[]
}) => {
    const user = await authenticate()
    if (!user) throw new Error("Unauthorized")

    try {
        const newDepartment = await prisma.department.create({
            data: {
                name: departmentData.name,
                code: departmentData.code,
                users: departmentData.selectedEmployees
                    ? {
                          connect: departmentData.selectedEmployees.map(
                              (id) => ({ id }),
                          ),
                      }
                    : undefined,
            },
        })
        return newDepartment
    } catch (error) {
        console.error(error)
        throw new Error("Failed to create department")
    }
}
