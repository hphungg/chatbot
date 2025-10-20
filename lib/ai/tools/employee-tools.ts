import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

export const getEmployeeByNameTool = tool({
    description:
        "Tìm kiếm thông tin nhân viên theo tên. Hữu ích khi người dùng hỏi về một nhân viên cụ thể hoặc muốn biết thông tin chi tiết của ai đó trong công ty.",
    inputSchema: z.object({
        name: z.string().describe("Tên hoặc họ tên của nhân viên cần tìm"),
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

export const getEmployeesByDepartmentTool = tool({
    description:
        "Lấy danh sách tất cả nhân viên trong một phòng ban cụ thể. Hữu ích khi người dùng muốn biết ai đang làm việc trong một phòng ban nào đó.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần tìm kiếm nhân viên"),
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
        "Lấy danh sách nhân viên đang tham gia một dự án cụ thể. Hữu ích khi người dùng muốn biết ai đang làm việc trong dự án nào đó.",
    inputSchema: z.object({
        projectName: z.string().describe("Tên dự án cần tìm kiếm nhân viên"),
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

export const getAllDepartmentsTool = tool({
    description:
        "Lấy danh sách tất cả các phòng ban trong công ty. Hữu ích khi người dùng muốn xem tổng quan về cơ cấu tổ chức.",
    inputSchema: z.object({}),
    execute: async () => {
        const departments = await prisma.department.findMany({
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
            orderBy: {
                name: "asc",
            },
        })

        return {
            success: true,
            message: `Tìm thấy ${departments.length} phòng ban`,
            departments: departments.map((dept) => ({
                name: dept.name,
                code: dept.code,
                employeeCount: dept._count.users,
            })),
        }
    },
})

export const getEmployeeByEmailTool = tool({
    description:
        "Tìm kiếm thông tin nhân viên theo địa chỉ email. Hữu ích khi người dùng cung cấp email của nhân viên.",
    inputSchema: z.object({
        email: z.string().email().describe("Địa chỉ email của nhân viên"),
    }),
    execute: async ({ email }) => {
        const employee = await prisma.user.findUnique({
            where: {
                email,
            },
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

export const employeeTools = {
    getEmployeeByName: getEmployeeByNameTool,
    getEmployeesByDepartment: getEmployeesByDepartmentTool,
    getEmployeesByProject: getEmployeesByProjectTool,
    getAllDepartments: getAllDepartmentsTool,
    getEmployeeByEmail: getEmployeeByEmailTool,
}
