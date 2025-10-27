import { tool } from "ai"
import { z } from "zod"
import { OAuth2Client } from "google-auth-library"
import { google } from "googleapis"
import { prisma } from "@/lib/db/prisma"

async function getGoogleAuthClient(userId: string) {
    const userToken = await prisma.account.findFirst({
        where: {
            userId: userId,
            providerId: "google",
        },
        select: {
            refreshToken: true,
        },
    })

    if (!userToken?.refreshToken) {
        throw new Error(
            "Không tìm thấy token Google. Vui lòng đăng nhập lại với Google.",
        )
    }

    const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    )

    oauth2Client.setCredentials({
        refresh_token: userToken.refreshToken,
    })

    const { credentials } = await oauth2Client.refreshAccessToken()
    oauth2Client.setCredentials(credentials)

    return oauth2Client
}

export const getCalendarListTool = tool({
    description:
        "Lấy danh sách tất cả các lịch (calendars) của người dùng từ Google Calendar. Sử dụng khi cần biết người dùng có những lịch nào.",
    inputSchema: z.object({
        userId: z.string().describe("ID của người dùng cần lấy danh sách lịch"),
    }),
    execute: async ({ userId }) => {
        try {
            const auth = await getGoogleAuthClient(userId)
            const calendar = google.calendar({ version: "v3", auth })

            const response = await calendar.calendarList.list()

            const calendars =
                response.data.items?.map((cal) => ({
                    id: cal.id || "",
                    summary: cal.summary || "Unknown",
                    description: cal.description || "",
                    timeZone: cal.timeZone || "",
                    primary: cal.primary || false,
                    accessRole: cal.accessRole || "",
                    backgroundColor: cal.backgroundColor || "",
                })) || []

            return {
                success: true,
                message: `Tìm thấy ${calendars.length} lịch`,
                calendars,
            }
        } catch (error) {
            console.error("Error fetching calendar list:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi lấy danh sách lịch: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const getCalendarEventsTool = tool({
    description:
        "Lấy danh sách các sự kiện (events) từ Google Calendar của người dùng. Sử dụng khi cần xem lịch trình của người dùng.",
    inputSchema: z.object({
        userId: z.string().describe("ID của người dùng cần lấy sự kiện"),
        calendarId: z
            .string()
            .optional()
            .default("primary")
            .describe("ID của lịch cần lấy sự kiện (mặc định: primary)"),
        maxResults: z
            .number()
            .optional()
            .default(50)
            .describe("Số lượng sự kiện tối đa cần lấy (mặc định: 50)"),
    }),
    execute: async ({ userId, calendarId, maxResults }) => {
        try {
            const auth = await getGoogleAuthClient(userId)
            const calendar = google.calendar({ version: "v3", auth })

            const response = await calendar.events.list({
                calendarId: calendarId || "primary",
                maxResults,
                singleEvents: true,
                orderBy: "startTime",
            })

            const events =
                response.data.items?.map((event) => ({
                    id: event.id || "",
                    title: event.summary || "Không có tiêu đề",
                    description: event.description || "",
                    location: event.location || "",
                    start: event.start?.dateTime || event.start?.date || "",
                    end: event.end?.dateTime || event.end?.date || "",
                    status: event.status || "",
                    creator: event.creator?.email || "",
                    attendees:
                        event.attendees?.map((att) => ({
                            email: att.email || "",
                            displayName: att.displayName || "",
                            responseStatus: att.responseStatus || "",
                        })) || [],
                    colorId: event.colorId || "",
                })) || []

            return {
                success: true,
                message: `Tìm thấy ${events.length} sự kiện`,
                events: events.sort((a, b) => {
                    const dateA = new Date(a.start).getTime()
                    const dateB = new Date(b.start).getTime()
                    return dateA - dateB
                }),
            }
        } catch (error) {
            console.error("Error fetching calendar events:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi lấy sự kiện: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const getCalendarEventsOnDateTool = tool({
    description:
        "Lấy danh sách các sự kiện trong một ngày cụ thể từ Google Calendar. Sử dụng khi cần xem lịch trình của người dùng trong một ngày nhất định.",
    inputSchema: z.object({
        userId: z.string().describe("ID của người dùng cần lấy sự kiện"),
        date: z
            .string()
            .describe(
                "Ngày cần lấy sự kiện (định dạng: YYYY-MM-DD, ví dụ: 2025-10-27)",
            ),
        calendarId: z
            .string()
            .optional()
            .default("primary")
            .describe("ID của lịch cần lấy sự kiện (mặc định: primary)"),
    }),
    execute: async ({ userId, date, calendarId }) => {
        try {
            const auth = await getGoogleAuthClient(userId)
            const calendar = google.calendar({ version: "v3", auth })

            const startDate = new Date(date)
            startDate.setHours(0, 0, 0, 0)

            const endDate = new Date(date)
            endDate.setHours(23, 59, 59, 999)

            const response = await calendar.events.list({
                calendarId: calendarId || "primary",
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                singleEvents: true,
                orderBy: "startTime",
            })

            const events =
                response.data.items?.map((event) => ({
                    id: event.id || "",
                    title: event.summary || "Không có tiêu đề",
                    description: event.description || "",
                    location: event.location || "",
                    start: event.start?.dateTime || event.start?.date || "",
                    end: event.end?.dateTime || event.end?.date || "",
                    status: event.status || "",
                    attendees:
                        event.attendees?.map((att) => ({
                            email: att.email || "",
                            displayName: att.displayName || "",
                            responseStatus: att.responseStatus || "",
                        })) || [],
                })) || []

            return {
                success: true,
                message: `Tìm thấy ${events.length} sự kiện vào ngày ${date}`,
                date,
                events,
            }
        } catch (error) {
            console.error("Error fetching events on date:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi lấy sự kiện: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const createCalendarEventTool = tool({
    description:
        "Tạo một sự kiện mới trong Google Calendar của người dùng. Sử dụng khi cần thêm lịch hẹn, cuộc họp, hoặc nhắc nhở vào lịch của người dùng.",
    inputSchema: z.object({
        userId: z.string().describe("ID của người dùng cần tạo sự kiện"),
        title: z.string().describe("Tiêu đề của sự kiện"),
        description: z
            .string()
            .optional()
            .describe("Mô tả chi tiết về sự kiện"),
        startTime: z
            .string()
            .describe(
                "Thời gian bắt đầu (định dạng ISO 8601, ví dụ: 2025-10-27T09:00:00)",
            ),
        endTime: z
            .string()
            .describe(
                "Thời gian kết thúc (định dạng ISO 8601, ví dụ: 2025-10-27T10:00:00)",
            ),
        location: z.string().optional().describe("Địa điểm tổ chức sự kiện"),
        attendees: z
            .array(z.string().email())
            .optional()
            .describe("Danh sách email của người tham dự"),
        colorId: z
            .string()
            .optional()
            .describe("ID màu sắc cho sự kiện (1-11, mặc định: 7 - xanh lam)"),
        calendarId: z
            .string()
            .optional()
            .default("primary")
            .describe("ID của lịch cần tạo sự kiện (mặc định: primary)"),
    }),
    execute: async ({
        userId,
        title,
        description,
        startTime,
        endTime,
        location,
        attendees,
        colorId,
        calendarId,
    }) => {
        try {
            const auth = await getGoogleAuthClient(userId)
            const calendar = google.calendar({ version: "v3", auth })

            const event = {
                summary: title,
                description: description,
                location: location,
                start: {
                    dateTime: new Date(startTime).toISOString(),
                    timeZone: "Asia/Ho_Chi_Minh",
                },
                end: {
                    dateTime: new Date(endTime).toISOString(),
                    timeZone: "Asia/Ho_Chi_Minh",
                },
                attendees: attendees?.map((email) => ({ email })),
                colorId: colorId || "7",
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "email", minutes: 24 * 60 },
                        { method: "popup", minutes: 30 },
                    ],
                },
            }

            const response = await calendar.events.insert({
                calendarId: calendarId || "primary",
                requestBody: event,
                sendUpdates: "all",
            })

            return {
                success: true,
                message: `Sự kiện "${title}" đã được tạo thành công`,
                event: {
                    id: response.data.id || "",
                    title: response.data.summary || "",
                    start: response.data.start?.dateTime || "",
                    end: response.data.end?.dateTime || "",
                    htmlLink: response.data.htmlLink || "",
                },
            }
        } catch (error) {
            console.error("Error creating calendar event:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi tạo sự kiện: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const deleteCalendarEventTool = tool({
    description:
        "Xóa một sự kiện khỏi Google Calendar của người dùng. Sử dụng khi cần hủy hoặc xóa lịch hẹn.",
    inputSchema: z.object({
        userId: z.string().describe("ID của người dùng cần xóa sự kiện"),
        eventId: z.string().describe("ID của sự kiện cần xóa"),
        calendarId: z
            .string()
            .optional()
            .default("primary")
            .describe("ID của lịch chứa sự kiện (mặc định: primary)"),
    }),
    execute: async ({ userId, eventId, calendarId }) => {
        try {
            const auth = await getGoogleAuthClient(userId)
            const calendar = google.calendar({ version: "v3", auth })

            await calendar.events.delete({
                calendarId: calendarId || "primary",
                eventId: eventId,
                sendUpdates: "all",
            })

            return {
                success: true,
                message: `Sự kiện đã được xóa thành công`,
            }
        } catch (error) {
            console.error("Error deleting calendar event:", error)
            return {
                success: false,
                message: `Có lỗi xảy ra khi xóa sự kiện: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    },
})

export const calendarTools = {
    getCalendarList: getCalendarListTool,
    getCalendarEvents: getCalendarEventsTool,
    getCalendarEventsOnDate: getCalendarEventsOnDateTool,
    createCalendarEvent: createCalendarEventTool,
    deleteCalendarEvent: deleteCalendarEventTool,
}
