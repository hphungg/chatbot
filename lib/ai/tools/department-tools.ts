import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

// Helper function để loại bỏ [blocked] khỏi email
const cleanEmail = (email: string): string => {
    return email.replace(/\s*\[blocked\]\s*/gi, "")
}

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
            return `❌ Không tìm thấy phòng ban với tên **"${name}"**`
        }

        let result = `## 🏢 Phòng ban **${department.name}**\n\n`
        result += `**🏷️ Mã phòng ban:** ${department.code}\n`
        if (department.manager) {
            result += `**👤 Quản lý:** ${department.manager.displayName || department.manager.name} _(${cleanEmail(department.manager.email)})_\n`
        } else {
            result += `**👤 Quản lý:** _Chưa có_\n`
        }
        result += `**👥 Số lượng nhân viên:** ${department._count.users}\n`
        result += `**📂 Số lượng dự án:** ${department._count.projects}\n`

        return result
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
            return `❌ Không tìm thấy phòng ban với mã **"${code}"**`
        }

        let result = `## 🏢 Phòng ban **${department.name}**\n\n`
        result += `**🏷️ Mã phòng ban:** ${department.code}\n`
        if (department.manager) {
            result += `**👤 Quản lý:** ${department.manager.displayName || department.manager.name} _(${cleanEmail(department.manager.email)})_\n`
        } else {
            result += `**👤 Quản lý:** _Chưa có_\n`
        }
        result += `**👥 Số lượng nhân viên:** ${department._count.users}\n`
        result += `**📂 Số lượng dự án:** ${department._count.projects}\n`

        return result
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

        let result = `## 🏢 Danh sách **${departments.length} phòng ban** trong công ty\n\n`

        departments.forEach((dept, index) => {
            result += `### ${index + 1}. **${dept.name}** _(${dept.code})_\n`
            if (dept.manager) {
                result += `- 👤 Quản lý: **${dept.manager.displayName || dept.manager.name}**\n`
            } else {
                result += `- 👤 Quản lý: _Chưa có_\n`
            }
            result += `- 👥 Số nhân viên: **${dept._count.users}**\n`
            result += `- 📂 Số dự án: **${dept._count.projects}**\n\n`
        })

        return result
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
            return `❌ Không tìm thấy phòng ban **"${departmentName}"**`
        }

        return `🏢 Phòng ban **${department.name}** _(${department.code})_ có **${department._count.users} nhân viên**`
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
            return `❌ Không tìm thấy phòng ban **"${departmentName}"**`
        }

        return `🏢 Phòng ban **${department.name}** _(${department.code})_ đang tham gia **${department._count.projects} dự án**`
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
            return `❌ Không tìm thấy phòng ban **"${departmentName}"**`
        }

        if (!department.manager) {
            return `⚠️ Phòng ban **${department.name}** _(${department.code})_ hiện chưa có quản lý`
        }

        return `## 👤 Quản lý phòng ban **${department.name}** _(${department.code})_\n\n**Họ tên:** ${department.manager.displayName || department.manager.name}\n**Email:** ${cleanEmail(department.manager.email)}\n**Vai trò:** Quản lý`
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
