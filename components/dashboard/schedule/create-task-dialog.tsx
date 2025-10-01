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
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { DialogDescription } from "@radix-ui/react-dialog"
import { createCalendarEvent } from "@/app/api/calendar/queries"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (selectedDate) {
            setDate(selectedDate)
        }
    }, [selectedDate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

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
            const result = await createCalendarEvent({
                title: title.trim(),
                description: description.trim(),
                startTime: startDateTime,
                endTime: endDateTime,
            })
            if (result) {
                toast.success("Lịch trình đã được tạo thành công!")
                router.refresh()
            }
        } catch (error) {
            console.error("Error creating calendar event:", error)
        } finally {
            setTitle("")
            setDescription("")
            setStartTime("")
            setEndTime("")
            onOpenChange(false)
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
                        <Label htmlFor="title">Tiêu đề *</Label>
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
                        />
                    </div>

                    <div className="space-y-2">
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
                                    selected={date}
                                    onSelect={(newDate) =>
                                        newDate && setDate(newDate)
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Giờ bắt đầu</Label>
                            <div className="relative">
                                <Clock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                <Input
                                    id="time"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) =>
                                        setStartTime(e.target.value)
                                    }
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Giờ kết thúc</Label>
                            <div className="relative">
                                <Clock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                <Input
                                    id="time"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit">Tạo lịch trình</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
