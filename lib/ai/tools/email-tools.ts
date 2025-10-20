import { tool } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { sendMail } from "@/lib/mail"

export const sendEmailToEmployeeTool = tool({
    description:
        "Gửi email cho một nhân viên cụ thể trong công ty. Dùng khi người dùng muốn gửi email cho một người cụ thể.",
    inputSchema: z.object({
        email: z.string().email().describe("Địa chỉ email của nhân viên"),
        subject: z.string().describe("Tiêu đề email"),
        message: z.string().describe("Nội dung email"),
    }),
    execute: async ({ email, subject, message }) => {
        try {
            const employee = await prisma.user.findUnique({
                where: {
                    email,
                },
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

            const htmlBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                        .content { padding: 20px; background-color: #ffffff; }
                        .footer { margin-top: 20px; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Xin chào ${employee.displayName || employee.name},</h2>
                        </div>
                        <div class="content">
                            ${message.replace(/\n/g, "<br>")}
                        </div>
                        <div class="footer">
                            <p>Email này được gửi từ hệ thống Chatbot của công ty.</p>
                        </div>
                    </div>
                </body>
                </html>
            `

            await sendMail({
                to: employee.email,
                name: employee.displayName || employee.name,
                subject,
                body: htmlBody,
            })

            return {
                success: true,
                message: `Email đã được gửi thành công đến ${employee.displayName || employee.name} (${employee.email})`,
            }
        } catch (error) {
            console.error("Error sending email:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const sendEmailToDepartmentTool = tool({
    description:
        "Gửi email cho tất cả nhân viên trong một phòng ban cụ thể. Hữu ích khi người dùng muốn thông báo hoặc gửi thông tin cho cả phòng ban.",
    inputSchema: z.object({
        departmentName: z
            .string()
            .describe("Tên hoặc mã phòng ban cần gửi email"),
        subject: z.string().describe("Tiêu đề email"),
        message: z.string().describe("Nội dung email"),
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
                const htmlBody = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                            .content { padding: 20px; background-color: #ffffff; }
                            .footer { margin-top: 20px; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
                            .department-badge { display: inline-block; background-color: #007bff; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; margin-bottom: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="department-badge">Phòng ban: ${department.name}</div>
                                <h2>Xin chào ${employee.displayName || employee.name},</h2>
                            </div>
                            <div class="content">
                                ${message.replace(/\n/g, "<br>")}
                            </div>
                            <div class="footer">
                                <p>Email này được gửi đến tất cả thành viên phòng ban ${department.name}.</p>
                                <p>Email được gửi từ hệ thống Chatbot của công ty.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `

                return sendMail({
                    to: employee.email,
                    name: employee.displayName || employee.name,
                    subject,
                    body: htmlBody,
                })
            })

            await Promise.all(emailPromises)

            return {
                success: true,
                message: `Email đã được gửi thành công đến ${department.users.length} nhân viên trong phòng ban ${department.name}`,
                recipients: department.users.map((emp) => ({
                    name: emp.displayName || emp.name,
                    email: emp.email,
                })),
            }
        } catch (error) {
            console.error("Error sending emails to department:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const sendEmailToMultipleEmployeesTool = tool({
    description:
        "Gửi email cho nhiều nhân viên cùng lúc bằng danh sách email. Hữu ích khi người dùng muốn gửi email cho một nhóm người cụ thể.",
    inputSchema: z.object({
        emails: z
            .array(z.string().email())
            .describe("Danh sách địa chỉ email của các nhân viên"),
        subject: z.string().describe("Tiêu đề email"),
        message: z.string().describe("Nội dung email"),
    }),
    execute: async ({ emails, subject, message }) => {
        try {
            const employees = await prisma.user.findMany({
                where: {
                    email: {
                        in: emails,
                    },
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
                const htmlBody = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                            .content { padding: 20px; background-color: #ffffff; }
                            .footer { margin-top: 20px; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>Xin chào ${employee.displayName || employee.name},</h2>
                                ${employee.department ? `<p>Phòng ban: ${employee.department.name}</p>` : ""}
                            </div>
                            <div class="content">
                                ${message.replace(/\n/g, "<br>")}
                            </div>
                            <div class="footer">
                                <p>Email này được gửi từ hệ thống Chatbot của công ty.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `

                return sendMail({
                    to: employee.email,
                    name: employee.displayName || employee.name,
                    subject,
                    body: htmlBody,
                })
            })

            await Promise.all(emailPromises)

            let resultMessage = `Email đã được gửi thành công đến ${employees.length} nhân viên`
            if (notFoundEmails.length > 0) {
                resultMessage += `. Không tìm thấy hoặc không thể gửi đến ${notFoundEmails.length} email: ${notFoundEmails.join(", ")}`
            }

            return {
                success: true,
                message: resultMessage,
                recipients: employees.map((emp) => ({
                    name: emp.displayName || emp.name,
                    email: emp.email,
                    department: emp.department?.name,
                })),
                notFoundEmails,
            }
        } catch (error) {
            console.error("Error sending emails to multiple employees:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const sendEmailByEmployeeNameTool = tool({
    description:
        "Gửi email cho nhân viên bằng tên của họ. Hữu ích khi người dùng biết tên nhân viên nhưng không biết email.",
    inputSchema: z.object({
        name: z.string().describe("Tên hoặc họ tên của nhân viên"),
        subject: z.string().describe("Tiêu đề email"),
        message: z.string().describe("Nội dung email"),
    }),
    execute: async ({ name, subject, message }) => {
        try {
            const employees = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: name, mode: "insensitive" } },
                        {
                            displayName: {
                                contains: name,
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
                    department: {
                        select: {
                            name: true,
                        },
                    },
                },
                take: 10,
            })

            if (employees.length === 0) {
                return {
                    success: false,
                    message: `Không tìm thấy nhân viên nào với tên "${name}"`,
                }
            }

            if (employees.length > 1) {
                return {
                    success: false,
                    message: `Tìm thấy ${employees.length} nhân viên với tên "${name}". Vui lòng cung cấp tên cụ thể hơn hoặc sử dụng email để gửi.`,
                    suggestions: employees.map((emp) => ({
                        name: emp.displayName || emp.name,
                        email: emp.email,
                        department: emp.department?.name,
                    })),
                }
            }

            const employee = employees[0]
            const htmlBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                        .content { padding: 20px; background-color: #ffffff; }
                        .footer { margin-top: 20px; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Xin chào ${employee.displayName || employee.name},</h2>
                        </div>
                        <div class="content">
                            ${message.replace(/\n/g, "<br>")}
                        </div>
                        <div class="footer">
                            <p>Email này được gửi từ hệ thống Chatbot của công ty.</p>
                        </div>
                    </div>
                </body>
                </html>
            `

            await sendMail({
                to: employee.email,
                name: employee.displayName || employee.name,
                subject,
                body: htmlBody,
            })

            return {
                success: true,
                message: `Email đã được gửi thành công đến ${employee.displayName || employee.name} (${employee.email})`,
            }
        } catch (error) {
            console.error("Error sending email by name:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi gửi email: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const emailTools = {
    sendEmailToEmployee: sendEmailToEmployeeTool,
    sendEmailToDepartment: sendEmailToDepartmentTool,
    sendEmailToMultipleEmployees: sendEmailToMultipleEmployeesTool,
    sendEmailByEmployeeName: sendEmailByEmployeeNameTool,
}
