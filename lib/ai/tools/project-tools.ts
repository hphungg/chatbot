import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

// Helper function để loại bỏ [blocked] khỏi email
const cleanEmail = (email: string): string => {
    return email.replace(/\s*\[blocked\]\s*/gi, "")
}

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
            return `❌ Không tìm thấy dự án với tên **"${name}"**`
        }

        const isActive = project.endDate
            ? new Date(project.endDate) > new Date()
            : true

        let result = `## 📂 Dự án **"${project.name}"**\n\n`
        result += `**🟢 Trạng thái:** ${isActive ? "✅ _Đang hoạt động_" : "✔️ _Đã hoàn thành_"}\n`
        if (project.startDate) {
            result += `**📅 Ngày bắt đầu:** ${new Date(project.startDate).toLocaleDateString("vi-VN")}\n`
        }
        if (project.endDate) {
            result += `**📅 Ngày kết thúc:** ${new Date(project.endDate).toLocaleDateString("vi-VN")}\n`
        }
        result += `**👥 Số nhân viên:** ${project._count.users}\n`
        result += `**🏢 Số phòng ban:** ${project._count.departments}\n\n`

        if (project.departments.length > 0) {
            result += `### 🏢 Phòng ban tham gia:\n`
            project.departments.forEach((pd, index) => {
                result += `${index + 1}. **${pd.department.name}** _(${pd.department.code})_\n`
            })
            result += "\n"
        }

        if (project.users.length > 0) {
            result += `### 👥 Nhân viên tham gia _(hiển thị 10 người đầu tiên)_:\n`
            project.users.forEach((up, index) => {
                result += `${index + 1}. **${up.user.displayName || up.user.name}** - ${cleanEmail(up.user.email)}\n`
            })
        }

        return result
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

        let result = `## 📂 Danh sách **${projects.length} dự án** trong công ty\n\n`

        projects.forEach((project, index) => {
            const isActive = project.endDate
                ? new Date(project.endDate) > new Date()
                : true

            result += `### ${index + 1}. **${project.name}** ${isActive ? "✅" : "✔️"}\n`
            result += `- **Trạng thái:** ${isActive ? "_Đang hoạt động_" : "_Đã hoàn thành_"}\n`
            if (project.startDate) {
                result += `- 📅 Bắt đầu: ${new Date(project.startDate).toLocaleDateString("vi-VN")}\n`
            }
            if (project.endDate) {
                result += `- 📅 Kết thúc: ${new Date(project.endDate).toLocaleDateString("vi-VN")}\n`
            }
            result += `- 👥 Số nhân viên: **${project._count.users}**\n`
            result += `- 🏢 Số phòng ban: **${project._count.departments}**\n\n`
        })

        return result
    },
})

export const getProjectCountTool = tool({
    description:
        "Lấy tổng số lượng dự án trong hệ thống. Sử dụng khi cần biết có bao nhiêu dự án trong công ty.",
    inputSchema: z.object({}),
    execute: async () => {
        const count = await prisma.project.count()

        return `📂 Hệ thống có tổng cộng **${count} dự án**`
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

        let result = `## 🟢 Có **${projects.length} dự án đang hoạt động**\n\n`

        projects.forEach((project, index) => {
            result += `### ${index + 1}. **${project.name}** ✅\n`
            if (project.startDate) {
                result += `- 📅 Bắt đầu: ${new Date(project.startDate).toLocaleDateString("vi-VN")}\n`
            }
            if (project.endDate) {
                result += `- 📅 Kết thúc dự kiến: ${new Date(project.endDate).toLocaleDateString("vi-VN")}\n`
            }
            result += `- 👥 Số nhân viên: **${project._count.users}**\n`
            result += `- 🏢 Số phòng ban: **${project._count.departments}**\n\n`
        })

        return result
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

        return `🟢 Hiện có **${count} dự án đang hoạt động**`
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

        let result = `## ✔️ Có **${projects.length} dự án đã hoàn thành**\n\n`

        projects.forEach((project, index) => {
            result += `### ${index + 1}. **${project.name}** ✔️\n`
            if (project.startDate) {
                result += `- 📅 Bắt đầu: ${new Date(project.startDate).toLocaleDateString("vi-VN")}\n`
            }
            if (project.endDate) {
                result += `- 📅 Kết thúc: ${new Date(project.endDate).toLocaleDateString("vi-VN")}\n`
            }
            result += `- 👥 Số nhân viên: **${project._count.users}**\n`
            result += `- 🏢 Số phòng ban: **${project._count.departments}**\n\n`
        })

        return result
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

        return `✔️ Có **${count} dự án đã hoàn thành**`
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
            return `❌ Không tìm thấy phòng ban **"${departmentName}"**`
        }

        let result = `## 🏢 Phòng ban **${department.name}** _(${department.code})_\n\n`
        result += `📂 Đang tham gia **${department.projects.length} dự án**:\n\n`

        department.projects.forEach((pd, index) => {
            const project = pd.project
            const isActive = project.endDate
                ? new Date(project.endDate) > new Date()
                : true

            result += `### ${index + 1}. **${project.name}** ${isActive ? "✅" : "✔️"}\n`
            result += `- **Trạng thái:** ${isActive ? "_Đang hoạt động_" : "_Đã hoàn thành_"}\n`
            if (project.startDate) {
                result += `- 📅 Bắt đầu: ${new Date(project.startDate).toLocaleDateString("vi-VN")}\n`
            }
            if (project.endDate) {
                result += `- 📅 Kết thúc: ${new Date(project.endDate).toLocaleDateString("vi-VN")}\n`
            }
            result += `- 👥 Số nhân viên: **${project._count.users}**\n`
            result += `- 🏢 Số phòng ban: **${project._count.departments}**\n\n`
        })

        return result
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
