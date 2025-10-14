export interface DepartmentOption {
    id: string
    name: string
}

export interface AdminProjectItem {
    id: string
    name: string
    departmentId: string | null
    departmentName: string | null
    memberCount: number
    startDate: string | null
    endDate: string | null
}

export interface ProjectFormValues {
    name: string
    departmentId: string | null
    startDate: string | null
    endDate: string | null
}
