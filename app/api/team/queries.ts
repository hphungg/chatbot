"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { User } from "@prisma/client"
import { headers } from "next/headers"

async function authenticate() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

export const getTeamMembers = async (): Promise<User[]> => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")
    if (user.role !== "manager")
        throw new Error("Only managers can access team members")

    try {
        const managedDepartment = await prisma.department.findFirst({
            where: {
                managerId: user.id,
            },
            include: {
                users: {
                    include: {
                        department: true,
                    },
                },
            },
        })

        if (!managedDepartment) {
            return []
        }

        return managedDepartment.users
    } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch team members")
    }
}

export const getAvailableUsersToInvite = async (): Promise<User[]> => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")
    if (user.role !== "manager")
        throw new Error("Only managers can invite members")

    try {
        const managedDepartment = await prisma.department.findFirst({
            where: {
                managerId: user.id,
            },
        })

        if (!managedDepartment) {
            return []
        }

        const users = await prisma.user.findMany({
            where: {
                departmentId: null,
                userVerified: true,
                banned: false,
            },
            include: {
                department: true,
            },
        })

        return users
    } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch available users")
    }
}

export const inviteMemberToDepartment = async (userId: string) => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")
    if (user.role !== "manager")
        throw new Error("Only managers can invite members")

    try {
        const managedDepartment = await prisma.department.findFirst({
            where: {
                managerId: user.id,
            },
        })

        if (!managedDepartment) {
            throw new Error("You don't manage any department")
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!targetUser) {
            throw new Error("User not found")
        }

        if (targetUser.departmentId) {
            throw new Error("User already belongs to a department")
        }

        await prisma.user.update({
            where: { id: userId },
            data: { departmentId: managedDepartment.id },
        })

        return true
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const removeMemberFromDepartment = async (userId: string) => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")
    if (user.role !== "manager")
        throw new Error("Only managers can remove members")

    try {
        const managedDepartment = await prisma.department.findFirst({
            where: {
                managerId: user.id,
            },
        })

        if (!managedDepartment) {
            throw new Error("You don't manage any department")
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!targetUser) {
            throw new Error("User not found")
        }

        if (targetUser.departmentId !== managedDepartment.id) {
            throw new Error("User is not in your department")
        }

        await prisma.user.update({
            where: { id: userId },
            data: { departmentId: null },
        })

        return true
    } catch (error) {
        console.error(error)
        throw error
    }
}
