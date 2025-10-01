"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { DialogDescription } from "@radix-ui/react-dialog"
import { createCalendarEvent } from "@/app/api/calendar/queries"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { eventColors } from "@/lib/event-color"

interface CreateTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedDate?: Date
}

export function CreateTaskDialog({
    open,
    onOpenChange,
    selectedDate,
}: CreateTaskDialogProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState<Date>(selectedDate || new Date())
    const [startTime, setStartTime] = useState("00:00:00")
    const [endTime, setEndTime] = useState("00:00:00")
    const [colorId, setColorId] = useState("7")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (selectedDate) {
            setDate(selectedDate)
        }
    }, [selectedDate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        if (!title.trim() || !startTime.trim() || !endTime.trim()) {
            return
        }

        try {
            const startDateTime = new Date(date)
            const [startHours, startMinutes] = startTime.split(":").map(Number)
            startDateTime.setHours(startHours, startMinutes, 0, 0)
            const endDateTime = new Date(date)
            const [endHours, endMinutes] = endTime.split(":").map(Number)
            endDateTime.setHours(endHours, endMinutes, 0, 0)

            if (endDateTime <= startDateTime) {
                toast.error("Giờ kết thúc phải muộn hơn giờ bắt đầu.")
                return
            }

            const result = await createCalendarEvent({
                title: title.trim(),
                description: description.trim(),
                startTime: startDateTime,
                endTime: endDateTime,
                colorId,
            })
            if (result) {
                toast.success("Lịch trình đã được tạo thành công!")
                router.refresh()
            } else {
                toast.error("Đã xảy ra lỗi khi tạo lịch trình.")
            }
            setTitle("")
            setDescription("")
            setStartTime("00:00:00")
            setEndTime("00:00:00")
            setColorId("7")
            onOpenChange(false)
        } catch (error) {
            console.error("Error creating calendar event:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo lịch trình mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin bên dưới để tạo lịch trình cá nhân.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input
                            id="title"
                            placeholder="Nhập tiêu đề công việc"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả chi tiết về công việc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Ngày</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(date, "dd/MM/yyyy")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        selected={date}
                                        onSelect={(newDate) =>
                                            newDate && setDate(newDate)
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Màu sắc</Label>
                            <Select value={colorId} onValueChange={setColorId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-4 w-4 rounded-full border border-gray-300"
                                                style={{
                                                    backgroundColor:
                                                        eventColors[
                                                            parseInt(colorId)
                                                        ],
                                                }}
                                            />
                                            <span>Màu {colorId}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(eventColors).map(
                                        ([id, color]) => (
                                            <SelectItem key={id} value={id}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-4 w-4 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                    />
                                                    <span>Màu {id}</span>
                                                </div>
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Giờ bắt đầu</Label>
                            <Input
                                id="time-start"
                                type="time"
                                step="1"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Giờ kết thúc</Label>
                            <Input
                                id="time-end"
                                type="time"
                                step="1"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Đang tạo lịch trình..."
                                : "Tạo lịch trình"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
