"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { ProjectMemberSummary, ProjectWithMembers } from "@/lib/types"
import { headers } from "next/headers"

async function authenticate() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

export const getProjectsWithMembers = async (): Promise<
    ProjectWithMembers[]
> => {
    const user = await authenticate()
    if (!user) throw new Error("Unauthorized")

    try {
        const projects = await prisma.project.findMany({
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                email: true,
                                image: true,
                                role: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return projects.map((project) => {
            const startDate =
                "startDate" in project
                    ? (project as { startDate: Date | null }).startDate
                    : null
            const endDate =
                "endDate" in project
                    ? (project as { endDate: Date | null }).endDate
                    : null
            const members: ProjectMemberSummary[] = project.users
                .map((link) => link.user)
                .filter((member): member is NonNullable<typeof member> =>
                    Boolean(member),
                )
                .map((member) => ({
                    id: member.id,
                    name: member.name,
                    displayName: member.displayName ?? null,
                    email: member.email,
                    image: member.image ?? null,
                    role: member.role,
                }))

            return {
                id: project.id,
                name: project.name,
                departmentId: project.departmentId ?? null,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                createdAt: project.createdAt.toISOString(),
                updatedAt: project.updatedAt.toISOString(),
                members,
            }
        })
    } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch projects")
    }
}
