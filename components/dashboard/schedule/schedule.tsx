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
} from "lucide-react"
import { vi } from "date-fns/locale"
import { format } from "date-fns"
import { CreateTaskDialog } from "./create-task-dialog"
import { Events } from "@/lib/types"
import { formatDateRange } from "little-date"

interface ScheduleProps {
    events: Events[]
}

export function Schedule({ events }: ScheduleProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showAllEvents, setShowAllEvents] = useState(false)

    const selectedDateEvents = events.filter((event) => {
        if (!date) return false
        const eventDate = new Date(event.start)
        return (
            eventDate.getFullYear() === date.getFullYear() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getDate() === date.getDate()
        )
    })

    const eventColors: Record<number, string> = {
        0: "#039be5",
        1: "#7986cb",
        2: "#33b679",
        3: "#8e24aa",
        4: "#e67c73",
        5: "#f6c026",
        6: "#f5511d",
        7: "#039be5",
        8: "#616161",
        9: "#3f51b5",
        10: "#0b8043",
        11: "#d60000",
    }

    const maxVisibleEvents = 4
    const visibleEvents = showAllEvents
        ? selectedDateEvents
        : selectedDateEvents.slice(0, maxVisibleEvents)
    const hasMoreEvents = selectedDateEvents.length > maxVisibleEvents

    return (
        <div className="flex h-full flex-col gap-6 lg:flex-row">
            <div className="flex flex-shrink-0 justify-center lg:justify-start">
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
                                        className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-2 transition-colors"
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
                                        <div className="text-muted-foreground ml-4 flex items-center gap-1 text-sm">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {formatDateRange(
                                                    new Date(event.start),
                                                    new Date(event.end),
                                                    {
                                                        locale: "vi",
                                                    },
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {hasMoreEvents && (
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            setShowAllEvents(!showAllEvents)
                                        }
                                        className="text-muted-foreground hover:text-foreground w-full justify-center gap-2 text-sm"
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
