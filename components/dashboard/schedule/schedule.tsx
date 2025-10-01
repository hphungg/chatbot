"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Plus,
    Clock,
    Calendar as CalendarIcon,
    ChevronDown,
    ChevronUp,
    Trash2,
} from "lucide-react"
import { vi } from "date-fns/locale"
import { format } from "date-fns"
import { CreateTaskDialog } from "./create-task-dialog"
import { Events } from "@/lib/types"
import { formatDateRange } from "little-date"
import { eventColors } from "@/lib/event-color"
import { deleteCalendarEvent } from "@/app/api/calendar/queries"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ScheduleProps {
    events: Events[]
}

export function Schedule({ events }: ScheduleProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showAllEvents, setShowAllEvents] = useState(false)
    const router = useRouter()

    const selectedDateEvents = events.filter((event) => {
        if (!date) return false
        const eventDate = new Date(event.start)
        return (
            eventDate.getFullYear() === date.getFullYear() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getDate() === date.getDate()
        )
    })

    const maxVisibleEvents = 4
    const visibleEvents = showAllEvents
        ? selectedDateEvents
        : selectedDateEvents.slice(0, maxVisibleEvents)
    const hasMoreEvents = selectedDateEvents.length > maxVisibleEvents

    const handleDeleteEvent = async (eventId: string) => {
        try {
            const response = await deleteCalendarEvent(eventId)
            if (response) {
                toast.success("Sự kiện đã được xóa")
                router.refresh()
            } else {
                toast.error("Xóa sự kiện thất bại")
            }
        } catch (error) {
            toast.error("Xóa sự kiện thất bại")
            console.error("Error deleting event:", error)
        }
    }

    return (
        <div className="flex h-full flex-col gap-6 lg:flex-row">
            <div className="flex flex-shrink-0 justify-center lg:justify-start lg:self-start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
                    buttonVariant="ghost"
                    classNames={{
                        day: "focus:ring-0",
                        caption_label: "text-lg font-semibold",
                    }}
                    locale={vi}
                />
            </div>

            <div className="min-w-0 flex-1">
                <Card className="h-full">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <CalendarIcon className="h-5 w-5" />
                                    Lịch trình
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {date
                                        ? format(date, "EEEE, dd/MM/yyyy", {
                                              locale: vi,
                                          })
                                        : "Chọn một ngày"}
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => setShowCreateDialog(true)}
                                className="shrink-0"
                                size="default"
                            >
                                <Plus className="h-4 w-4" />
                                Tạo mới
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedDateEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CalendarIcon className="text-muted-foreground mb-4 h-12 w-12" />
                                <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                                    Không có lịch trình nào
                                </h3>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    Chưa có lịch trình nào được lên cho ngày này
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {visibleEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="hover:bg-accent/50 flex items-center justify-between rounded-lg border px-2 py-1 transition-colors"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div
                                                className="h-6 w-1 flex-shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        eventColors[
                                                            event.colorId
                                                        ],
                                                }}
                                            />
                                            <div className="text-foreground flex-1 truncate font-medium">
                                                {event.title}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                                <span>
                                                    {formatDateRange(
                                                        new Date(event.start),
                                                        new Date(event.end),
                                                        {
                                                            locale: "vi",
                                                        },
                                                    )}
                                                </span>
                                                <Clock className="ml-1 h-4 w-4" />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteEvent(event.id)
                                                }
                                                className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {hasMoreEvents && (
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            setShowAllEvents(!showAllEvents)
                                        }
                                        className="text-muted-foreground hover:text-foreground w-full justify-center py-1 text-sm"
                                    >
                                        {showAllEvents ? (
                                            <>
                                                <ChevronUp className="h-4 w-4" />
                                                Thu gọn
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-4 w-4" />
                                                Xem thêm{" "}
                                                {selectedDateEvents.length -
                                                    maxVisibleEvents}{" "}
                                                sự kiện
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CreateTaskDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                selectedDate={date}
            />
        </div>
    )
}
