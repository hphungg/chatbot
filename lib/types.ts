export type Events = {
    id: string
    title: string
    creator: string
    start: string
    end: string
    eventType: string
    colorId: number
}

export interface ProjectMemberSummary {
    id: string
    name: string
    displayName: string | null
    email: string
    image: string | null
    role: string
}

export interface ProjectWithMembers {
    id: string
    name: string
    departmentId: string | null
    departmentName: string | null
    startDate: string | null
    endDate: string | null
    createdAt: string
    updatedAt: string
    members: ProjectMemberSummary[]
}
