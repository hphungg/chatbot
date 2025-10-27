import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

export const getEmployeeByNameTool = tool({
    description:
        "Tìm kiếm thông tin nhân viên theo tên hoặc họ tên. Sử dụng khi cần tra cứu thông tin chi tiết của một nhân viên cụ thể trong công ty.",
    inputSchema: z.object({
        name: z.string().describe("Tên hoặc họ tên của nhân viên cần tìm kiếm"),
    }),
    execute: async ({ name }) => {
        const employees = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: name, mode: "insensitive" } },
                    { displayName: { contains: name, mode: "insensitive" } },
                ],
                userVerified: true,
                banned: false,
            },
            select: {
                id: true,
                name: true,
                displayName: true,
                email: true,
                role: true,
                department: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
                projects: {
                    select: {
                        project: {
                            select: {
                                name: true,
                                startDate: true,
                                endDate: true,
                            },
                        },
                    },
                },
            },
            take: 10,
        })

        if (employees.length === 0) {
            return {
                success: false,
                message: `Không tìm thấy nhân viên nào với tên "${name}"`,
                employees: [],
            }
        }

        return {
            success: true,
            message: `Tìm thấy ${employees.length} nhân viên`,
            employees: employees.map((emp) => ({
                id: emp.id,
                name: emp.displayName || emp.name,
                email: emp.email,
                role: emp.role,
                department: emp.department
                    ? {
                          name: emp.department.name,
                          code: emp.department.code,
                      }
                    : null,
                projects: emp.projects.map((p) => ({
                    name: p.project.name,
                    startDate: p.project.startDate,
                    endDate: p.project.endDate,
                })),
            })),
        }
    },
})

export const getEmployeeByEmailTool = tool({
    description:
        "Tìm kiếm thông tin nhân viên theo địa chỉ email. Sử dụng khi người dùng cung cấp email cụ thể của nhân viên.",
    inputSchema: z.object({
        email: z
            .string()
            .email()
            .describe("Địa chỉ email của nhân viên cần tra cứu"),
    }),
    execute: async ({ email }) => {
        const employee = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                displayName: true,
                email: true,
                role: true,
                userVerified: true,
                banned: true,
                department: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
                projects: {
                    select: {
                        project: {
                            select: {
                                name: true,
                                startDate: true,
                                endDate: true,
                            },
                        },
                    },
                },
            },
        })

        if (!employee) {
            return {
                success: false,
                message: `Không tìm thấy nhân viên với email "${email}"`,
                employee: null,
            }
        }

        if (!employee.userVerified || employee.banned) {
            return {
                success: false,
                message: `Nhân viên với email "${email}" không có quyền truy cập hoặc đã bị cấm`,
                employee: null,
            }
        }

        return {
            success: true,
            message: "Tìm thấy thông tin nhân viên",
            employee: {
                id: employee.id,
                name: employee.displayName || employee.name,
                email: employee.email,
                role: employee.role,
                department: employee.department
                    ? {
                          name: employee.department.name,
                          code: employee.department.code,
                      }
                    : null,
                projects: employee.projects.map((p) => ({
                    name: p.project.name,
                    startDate: p.project.startDate,
                    endDate: p.project.endDate,
                })),
            },
        }
    },
})

export const getEmployeesByDepartmentTool = tool({
    description:
        "Lấy danh sách tất cả nhân viên trong một phòng ban cụ thể. Sử dụng khi cần biết thành viên của một phòng ban nào đó.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần lấy danh sách nhân viên"),
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
                users: {
                    where: {
                        userVerified: true,
                        banned: false,
                    },
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
                employees: [],
            }
        }

        return {
            success: true,
            message: `Tìm thấy ${department.users.length} nhân viên trong phòng ${department.name}`,
            department: {
                name: department.name,
                code: department.code,
            },
            employees: department.users.map((emp) => ({
                id: emp.id,
                name: emp.displayName || emp.name,
                email: emp.email,
                role: emp.role,
            })),
        }
    },
})

export const getEmployeesByProjectTool = tool({
    description:
        "Lấy danh sách nhân viên đang tham gia một dự án cụ thể. Sử dụng khi cần biết ai đang làm việc trong dự án nào đó.",
    inputSchema: z.object({
        projectName: z
            .string()
            .describe("Tên dự án cần lấy danh sách nhân viên"),
    }),
    execute: async ({ projectName }) => {
        const project = await prisma.project.findFirst({
            where: {
                name: { contains: projectName, mode: "insensitive" },
            },
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                email: true,
                                role: true,
                                department: {
                                    select: {
                                        name: true,
                                        code: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!project) {
            return {
                success: false,
                message: `Không tìm thấy dự án "${projectName}"`,
                project: null,
                employees: [],
            }
        }

        return {
            success: true,
            message: `Tìm thấy ${project.users.length} nhân viên trong dự án ${project.name}`,
            project: {
                name: project.name,
                startDate: project.startDate,
                endDate: project.endDate,
            },
            employees: project.users.map((up) => ({
                id: up.user.id,
                name: up.user.displayName || up.user.name,
                email: up.user.email,
                role: up.user.role,
                department: up.user.department
                    ? {
                          name: up.user.department.name,
                          code: up.user.department.code,
                      }
                    : null,
            })),
        }
    },
})

export const getAllEmployeesTool = tool({
    description:
        "Lấy danh sách tất cả nhân viên trong công ty. Sử dụng khi cần xem tổng quan về toàn bộ nhân sự.",
    inputSchema: z.object({
        limit: z
            .number()
            .optional()
            .default(50)
            .describe("Số lượng nhân viên tối đa cần lấy (mặc định 50)"),
    }),
    execute: async ({ limit }) => {
        const employees = await prisma.user.findMany({
            where: {
                userVerified: true,
                banned: false,
            },
            select: {
                id: true,
                name: true,
                displayName: true,
                email: true,
                role: true,
                department: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
            take: limit,
            orderBy: {
                name: "asc",
            },
        })

        return {
            success: true,
            message: `Tìm thấy ${employees.length} nhân viên`,
            employees: employees.map((emp) => ({
                id: emp.id,
                name: emp.displayName || emp.name,
                email: emp.email,
                role: emp.role,
                department: emp.department
                    ? {
                          name: emp.department.name,
                          code: emp.department.code,
                      }
                    : null,
            })),
        }
    },
})

export const getEmployeeCountTool = tool({
    description:
        "Lấy tổng số lượng nhân viên trong công ty. Sử dụng khi cần biết quy mô nhân sự của công ty.",
    inputSchema: z.object({}),
    execute: async () => {
        const count = await prisma.user.count({
            where: {
                userVerified: true,
                banned: false,
            },
        })

        return {
            success: true,
            message: `Công ty có tổng cộng ${count} nhân viên`,
            count,
        }
    },
})

export const employeeTools = {
    getEmployeeByName: getEmployeeByNameTool,
    getEmployeeByEmail: getEmployeeByEmailTool,
    getEmployeesByDepartment: getEmployeesByDepartmentTool,
    getEmployeesByProject: getEmployeesByProjectTool,
    getAllEmployees: getAllEmployeesTool,
    getEmployeeCount: getEmployeeCountTool,
}
