import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { sendMail } from "@/lib/mail"
import {
    getTaskReminderTemplate,
    getAnnouncementTemplate,
} from "@/lib/email/templates"
import { createCalendarEvent } from "@/app/api/calendar/queries"

// Helper function để loại bỏ [blocked] khỏi email
const cleanEmail = (email: string): string => {
    return email.replace(/\s*\[blocked\]\s*/gi, "")
}

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
        createCalendarEvent: z
            .boolean()
            .optional()
            .describe(
                "Có tạo sự kiện trong Google Calendar không? True nếu muốn tạo lịch hẹn",
            ),
        eventStartTime: z
            .string()
            .optional()
            .describe(
                "Thời gian bắt đầu sự kiện (ISO 8601 format hoặc YYYY-MM-DD HH:mm). Bắt buộc nếu createCalendarEvent = true",
            ),
        eventDuration: z
            .number()
            .optional()
            .describe(
                "Thời lượng sự kiện tính bằng phút (ví dụ: 60 cho 1 giờ, 30 cho 30 phút). Mặc định 60 phút",
            ),
    }),
    execute: async ({
        employeeName,
        taskTitle,
        taskDescription,
        dueDate,
        priority,
        createCalendarEvent: shouldCreateEvent,
        eventStartTime,
        eventDuration = 60,
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
                return `❌ Không tìm thấy nhân viên nào với tên **"${employeeName}"**`
            }

            if (employees.length > 1) {
                let result = `⚠️ Tìm thấy **${employees.length} nhân viên** với tên **"${employeeName}"**\n\nVui lòng chọn người cụ thể:\n\n`
                employees.forEach((emp, index) => {
                    result += `${index + 1}. **${emp.displayName || emp.name}** - ${cleanEmail(emp.email)}\n`
                })
                return result
            }

            const employee = employees[0]

            let calendarEventLink = ""
            let calendarEventId = ""

            // Tạo calendar event nếu được yêu cầu
            if (shouldCreateEvent && eventStartTime) {
                try {
                    const startDate = new Date(eventStartTime)
                    const endDate = new Date(
                        startDate.getTime() + eventDuration * 60000,
                    )

                    const calendarEvent = await createCalendarEvent({
                        title: taskTitle,
                        description:
                            taskDescription ||
                            `Nhắc nhở công việc cho ${employee.displayName || employee.name}`,
                        startTime: startDate,
                        endTime: endDate,
                        attendees: [employee.email],
                    })

                    calendarEventLink = calendarEvent.htmlLink || ""
                    calendarEventId = calendarEvent.id || ""
                } catch (calError) {
                    console.error("Error creating calendar event:", calError)
                    // Tiếp tục gửi email ngay cả khi tạo calendar event thất bại
                }
            }

            const htmlBody = getTaskReminderTemplate({
                recipientName: employee.displayName || employee.name,
                taskTitle,
                taskDescription,
                dueDate,
                priority,
                calendarInviteLink: calendarEventLink,
            })

            await sendMail({
                to: employee.email,
                name: employee.displayName || employee.name,
                subject: `⚠️ Nhắc nhở: ${taskTitle}`,
                body: htmlBody,
            })

            let result = `✅ Email nhắc nhở về công việc **"${taskTitle}"** đã được gửi thành công!\n\n👤 Người nhận: **${employee.displayName || employee.name}**\n📧 Email: ${cleanEmail(employee.email)}`

            if (calendarEventLink && eventStartTime) {
                const startTime = new Date(eventStartTime)
                result += `\n\n📅 **Đã tạo sự kiện Calendar:**\n- Thời gian: ${startTime.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}\n- Thời lượng: ${eventDuration} phút\n- Link: ${calendarEventLink}`
            }

            return result
        } catch (error) {
            console.error("Error sending task reminder:", error)
            return `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`
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
        createCalendarEvent: z
            .boolean()
            .optional()
            .describe(
                "Có tạo sự kiện trong Google Calendar không? True nếu muốn tạo lịch hẹn",
            ),
        eventStartTime: z
            .string()
            .optional()
            .describe(
                "Thời gian bắt đầu sự kiện (ISO 8601 format hoặc YYYY-MM-DD HH:mm). Bắt buộc nếu createCalendarEvent = true",
            ),
        eventDuration: z
            .number()
            .optional()
            .describe(
                "Thời lượng sự kiện tính bằng phút (ví dụ: 60 cho 1 giờ, 30 cho 30 phút). Mặc định 60 phút",
            ),
    }),
    execute: async ({
        email,
        taskTitle,
        taskDescription,
        dueDate,
        priority,
        createCalendarEvent: shouldCreateEvent,
        eventStartTime,
        eventDuration = 60,
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
                return `❌ Không tìm thấy nhân viên với email **${cleanEmail(email)}**`
            }

            if (!employee.userVerified || employee.banned) {
                return `⚠️ Không thể gửi email cho nhân viên này vì tài khoản chưa được xác minh hoặc đã bị cấm`
            }

            let calendarEventLink = ""
            let calendarEventId = ""

            // Tạo calendar event nếu được yêu cầu
            if (shouldCreateEvent && eventStartTime) {
                try {
                    const startDate = new Date(eventStartTime)
                    const endDate = new Date(
                        startDate.getTime() + eventDuration * 60000,
                    )

                    const calendarEvent = await createCalendarEvent({
                        title: taskTitle,
                        description:
                            taskDescription ||
                            `Nhắc nhở công việc cho ${employee.displayName || employee.name}`,
                        startTime: startDate,
                        endTime: endDate,
                        attendees: [employee.email],
                    })

                    calendarEventLink = calendarEvent.htmlLink || ""
                    calendarEventId = calendarEvent.id || ""
                } catch (calError) {
                    console.error("Error creating calendar event:", calError)
                }
            }

            const htmlBody = getTaskReminderTemplate({
                recipientName: employee.displayName || employee.name,
                taskTitle,
                taskDescription,
                dueDate,
                priority,
                calendarInviteLink: calendarEventLink,
            })

            await sendMail({
                to: employee.email,
                name: employee.displayName || employee.name,
                subject: `⚠️ Nhắc nhở: ${taskTitle}`,
                body: htmlBody,
            })

            let result = `✅ Email nhắc nhở về công việc **"${taskTitle}"** đã được gửi thành công!\n\n👤 Người nhận: **${employee.displayName || employee.name}**\n📧 Email: ${cleanEmail(employee.email)}`

            if (calendarEventLink && eventStartTime) {
                const startTime = new Date(eventStartTime)
                result += `\n\n📅 **Đã tạo sự kiện Calendar:**\n- Thời gian: ${startTime.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}\n- Thời lượng: ${eventDuration} phút\n- Link: ${calendarEventLink}`
            }

            return result
        } catch (error) {
            console.error("Error sending task reminder:", error)
            return `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`
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
                return `❌ Không tìm thấy phòng ban **"${departmentName}"**`
            }

            if (department.users.length === 0) {
                return `⚠️ Phòng ban **${department.name}** không có nhân viên nào`
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

            return `✅ Thông báo **"${subject}"** đã được gửi thành công!\n\n🏢 Phòng ban: **${department.name}** _(${department.code})_\n👥 Số người nhận: **${department.users.length} nhân viên**`
        } catch (error) {
            console.error("Error sending announcement to department:", error)
            return `Có lỗi xảy ra khi gửi thông báo: ${error instanceof Error ? error.message : "Unknown error"}`
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
                return "❌ Không tìm thấy nhân viên nào trong hệ thống"
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

            return `✅ Thông báo **"${subject}"** đã được gửi thành công đến toàn công ty!\n\n🏢 Phạm vi: **Toàn công ty**\n👥 Số người nhận: **${employees.length} nhân viên**`
        } catch (error) {
            console.error("Error sending announcement to company:", error)
            return `Có lỗi xảy ra khi gửi thông báo: ${error instanceof Error ? error.message : "Unknown error"}`
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
                return "❌ Không tìm thấy nhân viên nào với danh sách email đã cung cấp"
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

            let resultMessage = `✅ Thông báo **"${subject}"** đã được gửi thành công!\n\n👥 Số người nhận: **${employees.length} nhân viên**`
            if (notFoundEmails.length > 0) {
                resultMessage += `\n\n⚠️ **Lưu ý:** Không tìm thấy hoặc không thể gửi đến **${notFoundEmails.length} email**:\n${notFoundEmails.map((e) => `- ${cleanEmail(e)}`).join("\n")}`
            }

            return resultMessage
        } catch (error) {
            console.error(
                "Error sending announcement to multiple employees:",
                error,
            )
            return `Có lỗi xảy ra khi gửi thông báo: ${error instanceof Error ? error.message : "Unknown error"}`
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
