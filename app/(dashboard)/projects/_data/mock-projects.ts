export interface MockProject {
    id: string
    name: string
    members: number
    startDate: string // ISO date
    endDate?: string // ISO date or undefined
}

export const mockProjects: MockProject[] = [
    {
        id: "p1",
        name: "Tích hợp chatbot nội bộ",
        members: 8,
        startDate: "2024-05-01",
        endDate: "2024-11-30",
    },
    {
        id: "p2",
        name: "Website công ty mới",
        members: 5,
        startDate: "2024-01-15",
        endDate: "2024-06-30",
    },
    {
        id: "p3",
        name: "Nghiên cứu RAG và LLM",
        members: 3,
        startDate: "2024-08-01",
    },
]
