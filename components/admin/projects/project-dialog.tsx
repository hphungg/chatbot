"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type {
    AdminProjectItem,
    DepartmentOption,
    ProjectFormValues,
} from "./types"

interface ProjectDialogProps {
    mode: "create" | "edit"
    open: boolean
    onOpenChange: (open: boolean) => void
    loading: boolean
    project: AdminProjectItem | null
    departments: DepartmentOption[]
    onSubmit: (values: ProjectFormValues) => void
}

export function ProjectDialog({
    mode,
    open,
    onOpenChange,
    loading,
    project,
    departments,
    onSubmit,
}: ProjectDialogProps) {
    const [name, setName] = useState("")
    const [departmentId, setDepartmentId] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<string | null>(null)
    const [endDate, setEndDate] = useState<string | null>(null)

    useEffect(() => {
        if (!open) {
            return
        }
        setName(project?.name ?? "")
        setDepartmentId(project?.departmentId ?? null)
        setStartDate(project?.startDate ? project.startDate.slice(0, 10) : null)
        setEndDate(project?.endDate ? project.endDate.slice(0, 10) : null)
    }, [open, project])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSubmit({
            name,
            departmentId,
            startDate,
            endDate,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create"
                                ? "Thêm dự án"
                                : "Cập nhật dự án"}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === "create"
                                ? "Nhập thông tin dự án mới để bắt đầu theo dõi."
                                : "Điều chỉnh chi tiết dự án hiện tại."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="admin-project-name">
                                Tên dự án
                            </Label>
                            <Input
                                id="admin-project-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Ví dụ: Triển khai chatbot nội bộ"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phòng ban</Label>
                            <Select
                                value={departmentId ?? "__none"}
                                onValueChange={(value) =>
                                    setDepartmentId(
                                        value === "__none" ? null : value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn phòng ban" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none">
                                        Không phân bổ
                                    </SelectItem>
                                    {departments.map((department) => (
                                        <SelectItem
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="admin-project-start-date">
                                    Ngày bắt đầu
                                </Label>
                                <Input
                                    id="admin-project-start-date"
                                    type="date"
                                    value={startDate ?? ""}
                                    onChange={(event) =>
                                        setStartDate(
                                            event.target.value.length
                                                ? event.target.value
                                                : null,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-project-end-date">
                                    Ngày kết thúc
                                </Label>
                                <Input
                                    id="admin-project-end-date"
                                    type="date"
                                    value={endDate ?? ""}
                                    onChange={(event) =>
                                        setEndDate(
                                            event.target.value.length
                                                ? event.target.value
                                                : null,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {mode === "create" ? "Tạo dự án" : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
