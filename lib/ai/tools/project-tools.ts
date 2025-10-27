import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

export const getProjectByNameTool = tool({
    description:
        "Tra cứu thông tin chi tiết của một dự án theo tên. Sử dụng khi cần tìm hiểu về một dự án cụ thể trong công ty.",
    inputSchema: z.object({
        name: z.string().describe("Tên dự án cần tra cứu"),
    }),
    execute: async ({ name }) => {
        const project = await prisma.project.findFirst({
            where: {
                name: { contains: name, mode: "insensitive" },
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        departments: true,
                    },
                },
                users: {
                    take: 10,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                email: true,
                            },
                        },
                    },
                },
                departments: {
                    take: 10,
                    include: {
                        department: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
            },
        })

        if (!project) {
            return {
                success: false,
                message: `Không tìm thấy dự án với tên "${name}"`,
                project: null,
            }
        }

        const isActive = project.endDate
            ? new Date(project.endDate) > new Date()
            : true

        return {
            success: true,
            message: `Tìm thấy thông tin dự án ${project.name}`,
            project: {
                id: project.id,
                name: project.name,
                startDate: project.startDate,
                endDate: project.endDate,
                isActive,
                employeeCount: project._count.users,
                departmentCount: project._count.departments,
                employees: project.users.map((up) => ({
                    id: up.user.id,
                    name: up.user.displayName || up.user.name,
                    email: up.user.email,
                })),
                departments: project.departments.map((pd) => ({
                    id: pd.department.id,
                    name: pd.department.name,
                    code: pd.department.code,
                })),
            },
        }
    },
})

export const getAllProjectsTool = tool({
    description:
        "Lấy danh sách tất cả các dự án trong công ty. Sử dụng khi cần xem tổng quan về các dự án đang có.",
    inputSchema: z.object({
        limit: z
            .number()
            .optional()
            .default(50)
            .describe("Số lượng dự án tối đa cần lấy (mặc định 50)"),
    }),
    execute: async ({ limit }) => {
        const projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        departments: true,
                    },
                },
            },
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        })

        return {
            success: true,
            message: `Tìm thấy ${projects.length} dự án`,
            projects: projects.map((project) => {
                const isActive = project.endDate
                    ? new Date(project.endDate) > new Date()
                    : true

                return {
                    id: project.id,
                    name: project.name,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    isActive,
                    employeeCount: project._count.users,
                    departmentCount: project._count.departments,
                }
            }),
        }
    },
})

export const getProjectCountTool = tool({
    description:
        "Lấy tổng số lượng dự án trong hệ thống. Sử dụng khi cần biết có bao nhiêu dự án trong công ty.",
    inputSchema: z.object({}),
    execute: async () => {
        const count = await prisma.project.count()

        return {
            success: true,
            message: `Hệ thống có tổng cộng ${count} dự án`,
            count,
        }
    },
})

export const getActiveProjectsTool = tool({
    description:
        "Lấy danh sách các dự án đang hoạt động (chưa kết thúc hoặc không có ngày kết thúc). Sử dụng khi cần biết các dự án đang diễn ra.",
    inputSchema: z.object({
        limit: z
            .number()
            .optional()
            .default(50)
            .describe("Số lượng dự án tối đa cần lấy (mặc định 50)"),
    }),
    execute: async ({ limit }) => {
        const now = new Date()
        const projects = await prisma.project.findMany({
            where: {
                OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        departments: true,
                    },
                },
            },
            take: limit,
            orderBy: {
                startDate: "desc",
            },
        })

        return {
            success: true,
            message: `Tìm thấy ${projects.length} dự án đang hoạt động`,
            projects: projects.map((project) => ({
                id: project.id,
                name: project.name,
                startDate: project.startDate,
                endDate: project.endDate,
                employeeCount: project._count.users,
                departmentCount: project._count.departments,
            })),
        }
    },
})

export const getActiveProjectCountTool = tool({
    description:
        "Đếm số lượng dự án đang hoạt động (chưa kết thúc hoặc không có ngày kết thúc). Sử dụng khi cần biết có bao nhiêu dự án đang diễn ra.",
    inputSchema: z.object({}),
    execute: async () => {
        const now = new Date()
        const count = await prisma.project.count({
            where: {
                OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
        })

        return {
            success: true,
            message: `Hiện có ${count} dự án đang hoạt động`,
            count,
        }
    },
})

export const getCompletedProjectsTool = tool({
    description:
        "Lấy danh sách các dự án đã hoàn thành (đã qua ngày kết thúc). Sử dụng khi cần xem các dự án đã kết thúc.",
    inputSchema: z.object({
        limit: z
            .number()
            .optional()
            .default(50)
            .describe("Số lượng dự án tối đa cần lấy (mặc định 50)"),
    }),
    execute: async ({ limit }) => {
        const now = new Date()
        const projects = await prisma.project.findMany({
            where: {
                endDate: { lte: now },
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        departments: true,
                    },
                },
            },
            take: limit,
            orderBy: {
                endDate: "desc",
            },
        })

        return {
            success: true,
            message: `Tìm thấy ${projects.length} dự án đã hoàn thành`,
            projects: projects.map((project) => ({
                id: project.id,
                name: project.name,
                startDate: project.startDate,
                endDate: project.endDate,
                employeeCount: project._count.users,
                departmentCount: project._count.departments,
            })),
        }
    },
})

export const getCompletedProjectCountTool = tool({
    description:
        "Đếm số lượng dự án đã hoàn thành (đã qua ngày kết thúc). Sử dụng khi cần biết có bao nhiêu dự án đã kết thúc.",
    inputSchema: z.object({}),
    execute: async () => {
        const now = new Date()
        const count = await prisma.project.count({
            where: {
                endDate: { lte: now },
            },
        })

        return {
            success: true,
            message: `Có ${count} dự án đã hoàn thành`,
            count,
        }
    },
})

export const getProjectsByDepartmentTool = tool({
    description:
        "Lấy danh sách các dự án mà một phòng ban đang tham gia. Sử dụng khi cần biết phòng ban nào đó đang tham gia dự án gì.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần tra cứu dự án"),
    }),
    execute: async ({ departmentName }) => {
        const department = await prisma.department.findFirst({
            where: {
                OR: [
                    { name: { contains: departmentName, mode: "insensitive" } },
                    { code: { contains: departmentName, mode: "insensitive" } },
                ],
            },
            include: {
                projects: {
                    include: {
                        project: {
                            include: {
                                _count: {
                                    select: {
                                        users: true,
                                        departments: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!department) {
            return {
                success: false,
                message: `Không tìm thấy phòng ban "${departmentName}"`,
                department: null,
                projects: [],
            }
        }

        return {
            success: true,
            message: `Phòng ban ${department.name} đang tham gia ${department.projects.length} dự án`,
            department: {
                name: department.name,
                code: department.code,
            },
            projects: department.projects.map((pd) => {
                const project = pd.project
                const isActive = project.endDate
                    ? new Date(project.endDate) > new Date()
                    : true

                return {
                    id: project.id,
                    name: project.name,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    isActive,
                    employeeCount: project._count.users,
                    departmentCount: project._count.departments,
                }
            }),
        }
    },
})

export const projectTools = {
    getProjectByName: getProjectByNameTool,
    getAllProjects: getAllProjectsTool,
    getProjectCount: getProjectCountTool,
    getActiveProjects: getActiveProjectsTool,
    getActiveProjectCount: getActiveProjectCountTool,
    getCompletedProjects: getCompletedProjectsTool,
    getCompletedProjectCount: getCompletedProjectCountTool,
    getProjectsByDepartment: getProjectsByDepartmentTool,
}
