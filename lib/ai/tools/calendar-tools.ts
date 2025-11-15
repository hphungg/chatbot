import { tool } from "ai"
import { z } from "zod"
import {
    getCalendarEvents,
    createCalendarEvent as createEvent,
    deleteCalendarEvent as deleteEvent,
} from "@/app/api/calendar/queries"

// Helper function để lấy thời gian hiện tại theo múi giờ Hồ Chí Minh (UTC+7)
const getCurrentTimeInVietnam = (): Date => {
    const now = new Date()
    // Chuyển về múi giờ Việt Nam (UTC+7)
    const vietnamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
    )
    return vietnamTime
}

export const getCurrentDateTimeTool = tool({
    description:
        "Lấy thông tin về ngày giờ hiện tại theo múi giờ Việt Nam (UTC+7). LUÔN SỬ DỤNG tool này trước khi xử lý bất kỳ yêu cầu nào liên quan đến thời gian như: hôm nay, ngày mai, tuần này, tháng này, năm nay, bây giờ, hiện tại, hoặc bất kỳ tham chiếu thời gian tương đối nào khác.",
    inputSchema: z.object({}),
    execute: async () => {
        const now = getCurrentTimeInVietnam()

        const dayNames = [
            "Chủ nhật",
            "Thứ hai",
            "Thứ ba",
            "Thứ tư",
            "Thứ năm",
            "Thứ sáu",
            "Thứ bảy",
        ]
        const monthNames = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
        ]

        const result = {
            // Thông tin chi tiết
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            monthName: monthNames[now.getMonth()],
            date: now.getDate(),
            day: now.getDay(),
            dayName: dayNames[now.getDay()],
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),

            // Format đầy đủ
            fullDateTime: now.toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
            }),
            dateOnly: now.toLocaleDateString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
            }),
            timeOnly: now.toLocaleTimeString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
            }),

            // ISO format cho các tính toán
            isoString: now.toISOString(),
            isoDate: now.toISOString().split("T")[0], // YYYY-MM-DD

            // Timestamp
            timestamp: now.getTime(),

            // Timezone
            timezone: "Asia/Ho_Chi_Minh (UTC+7)",
        }

        return `## 🕐 Thông tin thời gian hiện tại

**📅 Ngày:** ${result.dayName}, ${result.date} ${result.monthName} năm ${result.year}
**⏰ Giờ:** ${result.timeOnly}
**🌏 Múi giờ:** ${result.timezone}

**Chi tiết:**
- Năm: ${result.year}
- Tháng: ${result.month} (${result.monthName})
- Ngày trong tháng: ${result.date}
- Thứ trong tuần: ${result.dayName}
- Giờ: ${result.hours}
- Phút: ${result.minutes}

**Format ISO (dùng cho tính toán):**
- ISO String: ${result.isoString}
- ISO Date: ${result.isoDate}

**Lưu ý:** Sử dụng các thông tin này để tính toán chính xác các ngày như "hôm nay", "ngày mai", "tuần này", v.v.`
    },
})

export const getCalendarEventsTool = tool({
    description:
        "Lấy danh sách tất cả các sự kiện (events) từ Google Calendar của người dùng hiện tại. Sử dụng khi cần xem toàn bộ lịch trình.",
    inputSchema: z.object({}),
    execute: async () => {
        try {
            const events = await getCalendarEvents()

            if (events.length === 0) {
                return "📅 Không có sự kiện nào trong lịch của bạn"
            }

            let result = `## 📅 Có **${events.length} sự kiện** trong lịch của bạn\n\n`

            events.forEach((event, index) => {
                result += `### ${index + 1}. **${event.title}**\n`
                if (event.start) {
                    result += `- ⏰ **Bắt đầu:** ${new Date(event.start).toLocaleString("vi-VN")}\n`
                }
                if (event.end) {
                    result += `- ⏰ **Kết thúc:** ${new Date(event.end).toLocaleString("vi-VN")}\n`
                }
                result += "\n"
            })

            return result
        } catch (error) {
            console.error("Error fetching calendar events:", error)
            return `❌ **Lỗi:** Không thể lấy danh sách sự kiện. ${error instanceof Error ? error.message : "Lỗi không xác định"}`
        }
    },
})

export const getTodayEventsTool = tool({
    description:
        "Lấy danh sách các sự kiện trong ngày hôm nay từ Google Calendar. Sử dụng khi người dùng hỏi về lịch hôm nay.",
    inputSchema: z.object({}),
    execute: async () => {
        try {
            const events = await getCalendarEvents()

            const today = getCurrentTimeInVietnam()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const todayEvents = events.filter((event) => {
                const eventStart = new Date(event.start)
                return eventStart >= today && eventStart < tomorrow
            })

            if (todayEvents.length === 0) {
                return "📅 Không có sự kiện nào trong ngày hôm nay"
            }

            let result = `## 📅 Lịch hôm nay (${today.toLocaleDateString("vi-VN")})\n\n`
            result += `Có **${todayEvents.length} sự kiện**:\n\n`

            todayEvents.forEach((event, index) => {
                result += `### ${index + 1}. **${event.title}**\n`
                if (event.start) {
                    result += `- ⏰ **Bắt đầu:** ${new Date(event.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}\n`
                }
                if (event.end) {
                    result += `- ⏰ **Kết thúc:** ${new Date(event.end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}\n`
                }
                result += "\n"
            })

            return result
        } catch (error) {
            console.error("Error fetching today events:", error)
            return `❌ **Lỗi:** Không thể lấy danh sách sự kiện hôm nay. ${error instanceof Error ? error.message : "Lỗi không xác định"}`
        }
    },
})

export const getWeekEventsTool = tool({
    description:
        "Lấy danh sách các sự kiện trong tuần này từ Google Calendar. Sử dụng khi người dùng hỏi về lịch tuần này.",
    inputSchema: z.object({}),
    execute: async () => {
        try {
            const events = await getCalendarEvents()

            const today = getCurrentTimeInVietnam()
            today.setHours(0, 0, 0, 0)

            // Tìm ngày đầu tuần (Thứ 2)
            const dayOfWeek = today.getDay()
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
            const weekStart = new Date(today)
            weekStart.setDate(today.getDate() + diff)

            // Ngày cuối tuần (Chủ nhật)
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 7)

            const weekEvents = events.filter((event) => {
                const eventStart = new Date(event.start)
                return eventStart >= weekStart && eventStart < weekEnd
            })

            if (weekEvents.length === 0) {
                return "📅 Không có sự kiện nào trong tuần này"
            }

            let result = `## 📅 Lịch tuần này (${weekStart.toLocaleDateString("vi-VN")} - ${weekEnd.toLocaleDateString("vi-VN")})\n\n`
            result += `Có **${weekEvents.length} sự kiện**:\n\n`

            // Nhóm sự kiện theo ngày
            const eventsByDay = new Map<string, typeof weekEvents>()
            weekEvents.forEach((event) => {
                const dateKey = new Date(event.start).toLocaleDateString(
                    "vi-VN",
                )
                if (!eventsByDay.has(dateKey)) {
                    eventsByDay.set(dateKey, [])
                }
                eventsByDay.get(dateKey)!.push(event)
            })

            eventsByDay.forEach((dayEvents, dateKey) => {
                result += `### 📆 ${dateKey}\n`
                dayEvents.forEach((event, index) => {
                    result += `${index + 1}. **${event.title}**`
                    if (event.start) {
                        result += ` - ${new Date(event.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                    }
                    if (event.end) {
                        result += ` đến ${new Date(event.end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                    }
                    result += "\n"
                })
                result += "\n"
            })

            return result
        } catch (error) {
            console.error("Error fetching week events:", error)
            return `❌ **Lỗi:** Không thể lấy danh sách sự kiện tuần này. ${error instanceof Error ? error.message : "Lỗi không xác định"}`
        }
    },
})

export const getDateRangeEventsTool = tool({
    description:
        "Lấy danh sách các sự kiện trong khoảng thời gian cụ thể từ Google Calendar. Sử dụng khi cần xem lịch trong một khoảng thời gian tùy chỉnh.",
    inputSchema: z.object({
        startDate: z.string().describe("Ngày bắt đầu (định dạng YYYY-MM-DD)"),
        endDate: z.string().describe("Ngày kết thúc (định dạng YYYY-MM-DD)"),
    }),
    execute: async ({ startDate, endDate }) => {
        try {
            const events = await getCalendarEvents()

            const start = new Date(startDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)

            const rangeEvents = events.filter((event) => {
                const eventStart = new Date(event.start)
                return eventStart >= start && eventStart <= end
            })

            if (rangeEvents.length === 0) {
                return `📅 Không có sự kiện nào từ ${start.toLocaleDateString("vi-VN")} đến ${end.toLocaleDateString("vi-VN")}`
            }

            let result = `## 📅 Lịch từ ${start.toLocaleDateString("vi-VN")} đến ${end.toLocaleDateString("vi-VN")}\n\n`
            result += `Có **${rangeEvents.length} sự kiện**:\n\n`

            // Nhóm sự kiện theo ngày
            const eventsByDay = new Map<string, typeof rangeEvents>()
            rangeEvents.forEach((event) => {
                const dateKey = new Date(event.start).toLocaleDateString(
                    "vi-VN",
                )
                if (!eventsByDay.has(dateKey)) {
                    eventsByDay.set(dateKey, [])
                }
                eventsByDay.get(dateKey)!.push(event)
            })

            eventsByDay.forEach((dayEvents, dateKey) => {
                result += `### 📆 ${dateKey}\n`
                dayEvents.forEach((event, index) => {
                    result += `${index + 1}. **${event.title}**`
                    if (event.start) {
                        result += ` - ${new Date(event.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                    }
                    if (event.end) {
                        result += ` đến ${new Date(event.end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                    }
                    result += "\n"
                })
                result += "\n"
            })

            return result
        } catch (error) {
            console.error("Error fetching date range events:", error)
            return `❌ **Lỗi:** Không thể lấy danh sách sự kiện. ${error instanceof Error ? error.message : "Lỗi không xác định"}`
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

            let response = `## ✅ Sự kiện đã được tạo thành công!\n\n`
            response += `**📌 Tiêu đề:** ${title}\n`
            response += `**⏰ Thời gian:** ${new Date(startTime).toLocaleString("vi-VN")} → ${new Date(endTime).toLocaleString("vi-VN")}\n`
            if (description) {
                response += `**📝 Mô tả:** ${description}\n`
            }
            if (result.htmlLink) {
                response += `\n🔗 [Xem trong Google Calendar](${result.htmlLink})`
            }

            return response
        } catch (error) {
            console.error("Error creating calendar event:", error)
            return `❌ Có lỗi xảy ra khi tạo sự kiện: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
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
                return `✅ Sự kiện đã được **xóa thành công**`
            } else {
                return `❌ Không thể xóa sự kiện`
            }
        } catch (error) {
            console.error("Error deleting calendar event:", error)
            return `❌ Có lỗi xảy ra khi xóa sự kiện: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
        }
    },
})

export const calendarTools = {
    getCurrentDateTime: getCurrentDateTimeTool,
    getCalendarEvents: getCalendarEventsTool,
    getTodayEvents: getTodayEventsTool,
    getWeekEvents: getWeekEventsTool,
    getDateRangeEvents: getDateRangeEventsTool,
    createCalendarEvent: createCalendarEventTool,
    deleteCalendarEvent: deleteCalendarEventTool,
}
