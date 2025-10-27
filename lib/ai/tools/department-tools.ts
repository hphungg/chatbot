import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

export const getDepartmentByNameTool = tool({
    description:
        "Tra cứu thông tin chi tiết của một phòng ban theo tên. Sử dụng khi cần tìm hiểu về một phòng ban cụ thể trong công ty.",
    inputSchema: z.object({
        name: z.string().describe("Tên phòng ban cần tra cứu"),
    }),
    execute: async ({ name }) => {
        const department = await prisma.department.findFirst({
            where: {
                name: { contains: name, mode: "insensitive" },
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        users: {
                            where: {
                                userVerified: true,
                                banned: false,
                            },
                        },
                        projects: true,
                    },
                },
            },
        })

        if (!department) {
            return {
                success: false,
                message: `Không tìm thấy phòng ban với tên "${name}"`,
                department: null,
            }
        }

        return {
            success: true,
            message: `Tìm thấy thông tin phòng ban ${department.name}`,
            department: {
                id: department.id,
                name: department.name,
                code: department.code,
                manager: department.manager
                    ? {
                          id: department.manager.id,
                          name:
                              department.manager.displayName ||
                              department.manager.name,
                          email: department.manager.email,
                      }
                    : null,
                employeeCount: department._count.users,
                projectCount: department._count.projects,
            },
        }
    },
})

export const getDepartmentByCodeTool = tool({
    description:
        "Tra cứu thông tin phòng ban theo mã phòng ban. Sử dụng khi người dùng cung cấp mã code của phòng ban.",
    inputSchema: z.object({
        code: z.string().describe("Mã code của phòng ban cần tra cứu"),
    }),
    execute: async ({ code }) => {
        const department = await prisma.department.findFirst({
            where: {
                code: { contains: code, mode: "insensitive" },
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        users: {
                            where: {
                                userVerified: true,
                                banned: false,
                            },
                        },
                        projects: true,
                    },
                },
            },
        })

        if (!department) {
            return {
                success: false,
                message: `Không tìm thấy phòng ban với mã "${code}"`,
                department: null,
            }
        }

        return {
            success: true,
            message: `Tìm thấy thông tin phòng ban ${department.name}`,
            department: {
                id: department.id,
                name: department.name,
                code: department.code,
                manager: department.manager
                    ? {
                          id: department.manager.id,
                          name:
                              department.manager.displayName ||
                              department.manager.name,
                          email: department.manager.email,
                      }
                    : null,
                employeeCount: department._count.users,
                projectCount: department._count.projects,
            },
        }
    },
})

export const getAllDepartmentsTool = tool({
    description:
        "Lấy danh sách tất cả các phòng ban trong công ty. Sử dụng khi cần xem tổng quan về cơ cấu tổ chức phòng ban.",
    inputSchema: z.object({}),
    execute: async () => {
        const departments = await prisma.department.findMany({
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        users: {
                            where: {
                                userVerified: true,
                                banned: false,
                            },
                        },
                        projects: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        })

        return {
            success: true,
            message: `Tìm thấy ${departments.length} phòng ban`,
            departments: departments.map((dept) => ({
                id: dept.id,
                name: dept.name,
                code: dept.code,
                manager: dept.manager
                    ? {
                          id: dept.manager.id,
                          name: dept.manager.displayName || dept.manager.name,
                          email: dept.manager.email,
                      }
                    : null,
                employeeCount: dept._count.users,
                projectCount: dept._count.projects,
            })),
        }
    },
})

export const getDepartmentEmployeeCountTool = tool({
    description:
        "Lấy số lượng nhân viên trong một phòng ban cụ thể. Sử dụng khi cần biết quy mô nhân sự của phòng ban.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần đếm số nhân viên"),
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
                _count: {
                    select: {
                        users: {
                            where: {
                                userVerified: true,
                                banned: false,
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
                employeeCount: 0,
            }
        }

        return {
            success: true,
            message: `Phòng ban ${department.name} có ${department._count.users} nhân viên`,
            department: {
                name: department.name,
                code: department.code,
            },
            employeeCount: department._count.users,
        }
    },
})

export const getDepartmentProjectCountTool = tool({
    description:
        "Lấy số lượng dự án mà một phòng ban đang tham gia. Sử dụng khi cần biết phòng ban đang tham gia bao nhiêu dự án.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần đếm số dự án"),
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
                _count: {
                    select: {
                        projects: true,
                    },
                },
            },
        })

        if (!department) {
            return {
                success: false,
                message: `Không tìm thấy phòng ban "${departmentName}"`,
                department: null,
                projectCount: 0,
            }
        }

        return {
            success: true,
            message: `Phòng ban ${department.name} đang tham gia ${department._count.projects} dự án`,
            department: {
                name: department.name,
                code: department.code,
            },
            projectCount: department._count.projects,
        }
    },
})

export const getDepartmentManagerTool = tool({
    description:
        "Tra cứu thông tin người quản lý của một phòng ban cụ thể. Sử dụng khi cần biết ai đang quản lý phòng ban nào đó.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần tra cứu quản lý"),
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
                manager: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        })

        if (!department) {
            return {
                success: false,
                message: `Không tìm thấy phòng ban "${departmentName}"`,
                department: null,
                manager: null,
            }
        }

        if (!department.manager) {
            return {
                success: false,
                message: `Phòng ban ${department.name} hiện chưa có quản lý`,
                department: {
                    name: department.name,
                    code: department.code,
                },
                manager: null,
            }
        }

        return {
            success: true,
            message: `Tìm thấy thông tin quản lý của phòng ban ${department.name}`,
            department: {
                name: department.name,
                code: department.code,
            },
            manager: {
                id: department.manager.id,
                name: department.manager.displayName || department.manager.name,
                email: department.manager.email,
                role: department.manager.role,
            },
        }
    },
})

export const departmentTools = {
    getDepartmentByName: getDepartmentByNameTool,
    getDepartmentByCode: getDepartmentByCodeTool,
    getAllDepartments: getAllDepartmentsTool,
    getDepartmentEmployeeCount: getDepartmentEmployeeCountTool,
    getDepartmentProjectCount: getDepartmentProjectCountTool,
    getDepartmentManager: getDepartmentManagerTool,
}
