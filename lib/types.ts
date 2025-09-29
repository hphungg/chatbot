export type User = {
    id: string
    email: string
    name: string
    image?: string | null | undefined
}

export type Department = {
    id: string
    name: string
    code: string
    employeeCount: number
    projectCount: number
    createdAt?: Date
    updatedAt?: Date
}

export type Attachment = {
    name: string
    url: string
    contentType: string
}
