"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { sendMail } from "@/lib/mail"
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
    if (user.role !== "manager" && user.role !== "employee")
        throw new Error("Only managers and employees can access team members")

    try {
        let department

        if (user.role === "manager") {
            department = await prisma.department.findFirst({
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
        } else {
            const currentUser = await prisma.user.findUnique({
                where: { id: user.id },
            })

            if (!currentUser?.departmentId) {
                return []
            }

            department = await prisma.department.findFirst({
                where: {
                    id: currentUser.departmentId,
                },
                include: {
                    users: {
                        include: {
                            department: true,
                        },
                    },
                },
            })
        }

        if (!department) {
            return []
        }

        return department.users
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

export const sendInvitationEmail = async (email: string, message: string) => {
    const user = await authenticate()

    if (!user) throw new Error("Unauthorized")
    if (user.role !== "manager")
        throw new Error("Only managers can send invitations")

    try {
        const managedDepartment = await prisma.department.findFirst({
            where: {
                managerId: user.id,
            },
        })

        if (!managedDepartment) {
            throw new Error("You don't manage any department")
        }

        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Lời mời tham gia đội</h2>
                <p>Xin chào,</p>
                <p>${message}</p>
                <p>Bạn được mời tham gia phòng ban: <strong>${managedDepartment.name}</strong></p>
                <p>Người gửi: <strong>${user.displayName || user.name}</strong></p>
                <br>
                <p>Trân trọng,</p>
                <p>Đội ngũ Chatbot</p>
            </div>
        `

        await sendMail({
            to: email,
            name: "Team Invitation",
            subject: `Lời mời tham gia phòng ban ${managedDepartment.name}`,
            body: emailBody,
        })

        return true
    } catch (error) {
        console.error(error)
        throw error
    }
}
