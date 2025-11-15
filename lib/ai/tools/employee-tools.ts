import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

// Helper function để dịch vai trò sang tiếng Việt
const translateRole = (role: string): string => {
    const roleMap: Record<string, string> = {
        admin: "Quản trị viên",
        manager: "Quản lý",
        employee: "Nhân viên",
        leader: "Trưởng nhóm",
        staff: "Nhân viên",
    }
    return roleMap[role.toLowerCase()] || role
}

// Helper function để loại bỏ [blocked] khỏi email
const cleanEmail = (email: string): string => {
    return email.replace(/\s*\[blocked\]\s*/gi, "")
}

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
            return `❌ Không tìm thấy nhân viên nào với tên **"${name}"**`
        }

        let result = `✅ Tìm thấy **${employees.length} nhân viên** có tên **"${name}"**:\n\n`

        employees.forEach((emp, index) => {
            result += `### ${index + 1}. **${emp.displayName || emp.name}**\n`
            result += `- 📧 Email: ${cleanEmail(emp.email)}\n`
            result += `- 👤 Vai trò: **${translateRole(emp.role)}**\n`
            if (emp.department) {
                result += `- 🏢 Phòng ban: **${emp.department.name}** (${emp.department.code})\n`
            }
            if (emp.projects.length > 0) {
                result += `- 📋 Dự án: *${emp.projects.map((p) => p.project.name).join(", ")}*\n`
            }
            result += "\n"
        })

        return result
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
            return `❌ Không tìm thấy nhân viên với email **${cleanEmail(email)}**`
        }

        if (!employee.userVerified || employee.banned) {
            return `⚠️ Nhân viên với email **${cleanEmail(email)}** không có quyền truy cập hoặc đã bị cấm`
        }

        let result = `## 📋 Thông tin nhân viên\n\n`
        result += `**👤 Họ tên:** ${employee.displayName || employee.name}\n`
        result += `**📧 Email:** ${cleanEmail(employee.email)}\n`
        result += `**💼 Vai trò:** ${translateRole(employee.role)}\n`
        if (employee.department) {
            result += `**🏢 Phòng ban:** ${employee.department.name} _(${employee.department.code})_\n`
        }
        if (employee.projects.length > 0) {
            result += `\n### 📂 Dự án đang tham gia:\n`
            employee.projects.forEach((p, index) => {
                result += `${index + 1}. **${p.project.name}**`
                if (p.project.startDate) {
                    result += ` - _Từ ${new Date(p.project.startDate).toLocaleDateString("vi-VN")}_`
                }
                if (p.project.endDate) {
                    result += ` _đến ${new Date(p.project.endDate).toLocaleDateString("vi-VN")}_`
                }
                result += "\n"
            })
        }

        return result
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
            return `❌ Không tìm thấy phòng ban **"${departmentName}"**`
        }

        let result = `## 🏢 Phòng ban **${department.name}** _(${department.code})_\n\n`
        result += `👥 Có **${department.users.length} nhân viên**:\n\n`

        department.users.forEach((emp, index) => {
            result += `### ${index + 1}. **${emp.displayName || emp.name}**\n`
            result += `- 📧 Email: ${cleanEmail(emp.email)}\n`
            result += `- 💼 Vai trò: **${translateRole(emp.role)}**\n\n`
        })

        return result
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
            return `❌ Không tìm thấy dự án **"${projectName}"**`
        }

        let result = `## 📂 Dự án **"${project.name}"**\n\n`
        if (project.startDate) {
            result += `📅 **Ngày bắt đầu:** ${new Date(project.startDate).toLocaleDateString("vi-VN")}\n`
        }
        if (project.endDate) {
            result += `📅 **Ngày kết thúc:** ${new Date(project.endDate).toLocaleDateString("vi-VN")}\n`
        }
        result += `\n👥 Có **${project.users.length} nhân viên** tham gia:\n\n`

        project.users.forEach((up, index) => {
            result += `### ${index + 1}. **${up.user.displayName || up.user.name}**\n`
            result += `- 📧 Email: ${cleanEmail(up.user.email)}\n`
            result += `- 💼 Vai trò: **${translateRole(up.user.role)}**\n`
            if (up.user.department) {
                result += `- 🏢 Phòng ban: **${up.user.department.name}** _(${up.user.department.code})_\n`
            }
            result += "\n"
        })

        return result
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

        let result = `## 👥 Danh sách **${employees.length} nhân viên** trong công ty\n\n`

        employees.forEach((emp, index) => {
            result += `### ${index + 1}. **${emp.displayName || emp.name}**\n`
            result += `- 📧 Email: ${cleanEmail(emp.email)}\n`
            result += `- 💼 Vai trò: **${translateRole(emp.role)}**\n`
            if (emp.department) {
                result += `- 🏢 Phòng ban: **${emp.department.name}** _(${emp.department.code})_\n`
            }
            result += "\n"
        })

        return result
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

        return `👥 Công ty có tổng cộng **${count} nhân viên**`
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
