import { User } from "@prisma/client"

export type Events = {
    id: string
    title: string
    creator: string
    start: string
    end: string
    eventType: string
    colorId: number
}

export interface DepartmentWithStats {
    id: string
    name: string
    code: string
    employeeCount?: number | null
    projectCount?: number | null
    manager?: {
        id: string
        name: string
        displayName?: string | null
        email: string
    } | null
}

export interface ProjectWithStats {
    id: string
    name: string
    departmentNames: string[]
    departmentIds: string[]
    memberCount: number
    startDate: string | null
    endDate: string | null
    members?: User[]
}
