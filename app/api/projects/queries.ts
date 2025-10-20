"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { ProjectWithStats } from "@/lib/types"
import { headers } from "next/headers"

async function authenticate() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

export const getProjectsWithMembers = async (): Promise<ProjectWithStats[]> => {
    const user = await authenticate()
    if (!user) throw new Error("Unauthorized")

    try {
        const projects = await prisma.project.findMany({
            include: {
                departments: {
                    include: {
                        department: true,
                    },
                },
                users: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return projects.map((project) => ({
            id: project.id,
            name: project.name,
            departmentNames: project.departments.map((d) => d.department.name),
            memberCount: project.users.length,
            startDate: project.startDate
                ? project.startDate.toISOString()
                : null,
            endDate: project.endDate ? project.endDate.toISOString() : null,
            members: project.users.map((pu) => pu.user),
        })) as ProjectWithStats[]
    } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch projects")
    }
}
