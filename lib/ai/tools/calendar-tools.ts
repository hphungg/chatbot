import { tool } from "ai"
import { z } from "zod"
import {
    getCalendarEvents,
    createCalendarEvent as createEvent,
    deleteCalendarEvent as deleteEvent,
} from "@/app/api/calendar/queries"

export const getCalendarEventsTool = tool({
    description:
        "Lấy danh sách các sự kiện (events) từ Google Calendar của người dùng hiện tại. Sử dụng khi cần xem lịch trình.",
    inputSchema: z.object({}),
    execute: async () => {
        try {
            const events = await getCalendarEvents()

            return {
                success: true,
                message: `Tìm thấy ${events.length} sự kiện`,
                events,
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

export const createCalendarEventTool = tool({
    description:
        "Tạo một sự kiện mới trong Google Calendar của người dùng hiện tại. Sử dụng khi cần thêm lịch hẹn, cuộc họp, hoặc nhắc nhở vào lịch.",
    inputSchema: z.object({
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
        colorId: z
            .string()
            .optional()
            .describe("ID màu sắc cho sự kiện (1-11, mặc định: 7 - xanh lam)"),
    }),
    execute: async ({ title, description, startTime, endTime, colorId }) => {
        try {
            const result = await createEvent({
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                colorId,
            })

            return {
                success: true,
                message: `Sự kiện "${title}" đã được tạo thành công`,
                event: {
                    id: result.id || "",
                    title: result.summary || "",
                    start: result.start?.dateTime || "",
                    end: result.end?.dateTime || "",
                    htmlLink: result.htmlLink || "",
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
        "Xóa một sự kiện khỏi Google Calendar của người dùng hiện tại. Sử dụng khi cần hủy hoặc xóa lịch hẹn.",
    inputSchema: z.object({
        eventId: z.string().describe("ID của sự kiện cần xóa"),
    }),
    execute: async ({ eventId }) => {
        try {
            const result = await deleteEvent(eventId)

            if (result) {
                return {
                    success: true,
                    message: `Sự kiện đã được xóa thành công`,
                }
            } else {
                return {
                    success: false,
                    message: `Không thể xóa sự kiện`,
                }
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
    getCalendarEvents: getCalendarEventsTool,
    createCalendarEvent: createCalendarEventTool,
    deleteCalendarEvent: deleteCalendarEventTool,
}
