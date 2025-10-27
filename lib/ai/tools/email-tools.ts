import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { sendMail } from "@/lib/mail"
import {
    getTaskReminderTemplate,
    getAnnouncementTemplate,
} from "@/lib/email/templates"

export const sendTaskReminderToEmployeeTool = tool({
    description:
        "Gửi email nhắc nhở về công việc cho một nhân viên cụ thể theo tên. Sử dụng khi cần nhắc nhở nhân viên về task, deadline hoặc công việc cần làm.",
    inputSchema: z.object({
        employeeName: z
            .string()
            .describe("Tên hoặc họ tên của nhân viên cần nhắc nhở"),
        taskTitle: z.string().describe("Tiêu đề công việc cần nhắc nhở"),
        taskDescription: z
            .string()
            .optional()
            .describe("Mô tả chi tiết về công việc"),
        dueDate: z.string().optional().describe("Hạn chót của công việc"),
        priority: z
            .enum(["HIGH", "MEDIUM", "LOW"])
            .optional()
            .describe("Mức độ ưu tiên của công việc"),
    }),
    execute: async ({
        employeeName,
        taskTitle,
        taskDescription,
        dueDate,
        priority,
    }) => {
        try {
            const employees = await prisma.user.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: employeeName,
                                mode: "insensitive",
                            },
                        },
                        {
                            displayName: {
                                contains: employeeName,
                                mode: "insensitive",
                            },
                        },
                    ],
                    userVerified: true,
                    banned: false,
                },
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                    email: true,
                },
                take: 5,
            })

            if (employees.length === 0) {
                return {
                    success: false,
                    message: `Không tìm thấy nhân viên nào với tên "${employeeName}"`,
                }
            }

            if (employees.length > 1) {
                return {
                    success: false,
                    message: `Tìm thấy ${employees.length} nhân viên với tên "${employeeName}". Vui lòng cung cấp tên cụ thể hơn hoặc sử dụng email.`,
                    suggestions: employees.map((emp) => ({
                        name: emp.displayName || emp.name,
                        email: emp.email,
                    })),
                }
            }

            const employee = employees[0]
            const htmlBody = getTaskReminderTemplate({
                recipientName: employee.displayName || employee.name,
                taskTitle,
                taskDescription,
                dueDate,
                priority,
            })

            await sendMail({
                to: employee.email,
                name: employee.displayName || employee.name,
                subject: `⚠️ Nhắc nhở: ${taskTitle}`,
                body: htmlBody,
            })

            return {
                success: true,
                message: `Email nhắc nhở đã được gửi thành công đến ${employee.displayName || employee.name} (${employee.email})`,
                recipient: {
                    name: employee.displayName || employee.name,
                    email: employee.email,
                },
            }
        } catch (error) {
            console.error("Error sending task reminder:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const sendTaskReminderByEmailTool = tool({
    description:
        "Gửi email nhắc nhở về công việc cho một nhân viên cụ thể theo địa chỉ email. Sử dụng khi biết chính xác email của nhân viên.",
    inputSchema: z.object({
        email: z
            .string()
            .email()
            .describe("Địa chỉ email của nhân viên cần nhắc nhở"),
        taskTitle: z.string().describe("Tiêu đề công việc cần nhắc nhở"),
        taskDescription: z
            .string()
            .optional()
            .describe("Mô tả chi tiết về công việc"),
        dueDate: z.string().optional().describe("Hạn chót của công việc"),
        priority: z
            .enum(["HIGH", "MEDIUM", "LOW"])
            .optional()
            .describe("Mức độ ưu tiên của công việc"),
    }),
    execute: async ({
        email,
        taskTitle,
        taskDescription,
        dueDate,
        priority,
    }) => {
        try {
            const employee = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                    email: true,
                    userVerified: true,
                    banned: true,
                },
            })

            if (!employee) {
                return {
                    success: false,
                    message: `Không tìm thấy nhân viên với email "${email}"`,
                }
            }

            if (!employee.userVerified || employee.banned) {
                return {
                    success: false,
                    message: `Không thể gửi email cho nhân viên này vì tài khoản chưa được xác minh hoặc đã bị cấm`,
                }
            }

            const htmlBody = getTaskReminderTemplate({
                recipientName: employee.displayName || employee.name,
                taskTitle,
                taskDescription,
                dueDate,
                priority,
            })

            await sendMail({
                to: employee.email,
                name: employee.displayName || employee.name,
                subject: `⚠️ Nhắc nhở: ${taskTitle}`,
                body: htmlBody,
            })

            return {
                success: true,
                message: `Email nhắc nhở đã được gửi thành công đến ${employee.displayName || employee.name} (${employee.email})`,
                recipient: {
                    name: employee.displayName || employee.name,
                    email: employee.email,
                },
            }
        } catch (error) {
            console.error("Error sending task reminder:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const sendAnnouncementToDepartmentTool = tool({
    description:
        "Gửi email thông báo cho tất cả nhân viên trong một phòng ban cụ thể. Sử dụng khi cần thông báo tin tức, chính sách, hoặc thông tin quan trọng cho cả phòng ban.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần gửi thông báo"),
        subject: z.string().describe("Tiêu đề thông báo"),
        message: z.string().describe("Nội dung thông báo"),
    }),
    execute: async ({ departmentName, subject, message }) => {
        try {
            const department = await prisma.department.findFirst({
                where: {
                    OR: [
                        {
                            name: {
                                contains: departmentName,
                                mode: "insensitive",
                            },
                        },
                        {
                            code: {
                                contains: departmentName,
                                mode: "insensitive",
                            },
                        },
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
                        },
                    },
                },
            })

            if (!department) {
                return {
                    success: false,
                    message: `Không tìm thấy phòng ban "${departmentName}"`,
                }
            }

            if (department.users.length === 0) {
                return {
                    success: false,
                    message: `Phòng ban ${department.name} không có nhân viên nào`,
                }
            }

            const emailPromises = department.users.map((employee) => {
                const htmlBody = getAnnouncementTemplate({
                    recipientName: employee.displayName || employee.name,
                    subject,
                    message,
                    departmentName: department.name,
                })

                return sendMail({
                    to: employee.email,
                    name: employee.displayName || employee.name,
                    subject: `📢 ${subject}`,
                    body: htmlBody,
                })
            })

            await Promise.all(emailPromises)

            return {
                success: true,
                message: `Thông báo đã được gửi thành công đến ${department.users.length} nhân viên trong phòng ban ${department.name}`,
                department: {
                    name: department.name,
                    code: department.code,
                },
                recipientCount: department.users.length,
            }
        } catch (error) {
            console.error("Error sending announcement to department:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi thông báo: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const sendAnnouncementToCompanyTool = tool({
    description:
        "Gửi email thông báo cho toàn bộ nhân viên trong công ty. Sử dụng khi cần thông báo tin tức quan trọng, chính sách công ty, hoặc thông tin cấp công ty.",
    inputSchema: z.object({
        subject: z.string().describe("Tiêu đề thông báo"),
        message: z.string().describe("Nội dung thông báo"),
    }),
    execute: async ({ subject, message }) => {
        try {
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
                    department: {
                        select: {
                            name: true,
                        },
                    },
                },
            })

            if (employees.length === 0) {
                return {
                    success: false,
                    message: "Không tìm thấy nhân viên nào trong hệ thống",
                }
            }

            const emailPromises = employees.map((employee) => {
                const htmlBody = getAnnouncementTemplate({
                    recipientName: employee.displayName || employee.name,
                    subject,
                    message,
                    isCompanyWide: true,
                })

                return sendMail({
                    to: employee.email,
                    name: employee.displayName || employee.name,
                    subject: `📢 [Toàn công ty] ${subject}`,
                    body: htmlBody,
                })
            })

            await Promise.all(emailPromises)

            return {
                success: true,
                message: `Thông báo đã được gửi thành công đến ${employees.length} nhân viên trong công ty`,
                recipientCount: employees.length,
            }
        } catch (error) {
            console.error("Error sending announcement to company:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi thông báo: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const sendAnnouncementToMultipleEmployeesTool = tool({
    description:
        "Gửi email thông báo cho nhiều nhân viên cùng lúc bằng danh sách email. Sử dụng khi cần gửi thông báo cho một nhóm nhân viên cụ thể.",
    inputSchema: z.object({
        emails: z
            .array(z.string().email())
            .describe("Danh sách địa chỉ email của các nhân viên"),
        subject: z.string().describe("Tiêu đề thông báo"),
        message: z.string().describe("Nội dung thông báo"),
    }),
    execute: async ({ emails, subject, message }) => {
        try {
            const employees = await prisma.user.findMany({
                where: {
                    email: { in: emails },
                    userVerified: true,
                    banned: false,
                },
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                    email: true,
                    department: {
                        select: {
                            name: true,
                        },
                    },
                },
            })

            if (employees.length === 0) {
                return {
                    success: false,
                    message:
                        "Không tìm thấy nhân viên nào với danh sách email đã cung cấp",
                }
            }

            const notFoundEmails = emails.filter(
                (email) => !employees.find((emp) => emp.email === email),
            )

            const emailPromises = employees.map((employee) => {
                const htmlBody = getAnnouncementTemplate({
                    recipientName: employee.displayName || employee.name,
                    subject,
                    message,
                })

                return sendMail({
                    to: employee.email,
                    name: employee.displayName || employee.name,
                    subject: `📢 ${subject}`,
                    body: htmlBody,
                })
            })

            await Promise.all(emailPromises)

            let resultMessage = `Thông báo đã được gửi thành công đến ${employees.length} nhân viên`
            if (notFoundEmails.length > 0) {
                resultMessage += `. Không tìm thấy hoặc không thể gửi đến ${notFoundEmails.length} email: ${notFoundEmails.join(", ")}`
            }

            return {
                success: true,
                message: resultMessage,
                recipientCount: employees.length,
                notFoundEmails,
            }
        } catch (error) {
            console.error(
                "Error sending announcement to multiple employees:",
                error,
            )
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi thông báo: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const emailTools = {
    sendTaskReminderToEmployee: sendTaskReminderToEmployeeTool,
    sendTaskReminderByEmail: sendTaskReminderByEmailTool,
    sendAnnouncementToDepartment: sendAnnouncementToDepartmentTool,
    sendAnnouncementToCompany: sendAnnouncementToCompanyTool,
    sendAnnouncementToMultipleEmployees:
        sendAnnouncementToMultipleEmployeesTool,
}
