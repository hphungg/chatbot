"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDepartments } from "@/app/(dashboard)/departments/_components/context"
import { EmployeeSelector } from "./employee-selector"
import { createDepartment } from "@/app/api/departments/queries"
import { useRouter } from "next/navigation"

export function CreateDepartmentDialog() {
    const { open, setOpen } = useDepartments()
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        selectedEmployees: [] as string[],
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isOpen = open === "add"
    const router = useRouter()

    const handleClose = () => {
        setOpen(null)
        setFormData({
            name: "",
            code: "",
            selectedEmployees: [],
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.code.trim()) {
            toast.error("Hãy điền đầy đủ các thông tin bắt buộc")
            return
        }

        setIsSubmitting(true)

        try {
            await createDepartment({
                name: formData.name,
                code: formData.code,
                selectedEmployees: formData.selectedEmployees,
            })

            toast.success("Tạo phòng ban thành công!")
            handleClose()
            router.refresh()
        } catch (error) {
            console.error("Error creating department:", error)
            toast.error("Tạo phòng ban thất bại")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleEmployeeSelectionChange = (employees: string[]) => {
        setFormData((prev) => ({
            ...prev,
            selectedEmployees: employees,
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tạo phòng ban mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin bên dưới.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1" className="ml-2">
                                <span>Tên phòng ban</span>
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name-1"
                                name="name"
                                value={formData.name}
                                onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                }
                                placeholder="Nhập tên phòng ban"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="code-1" className="ml-2">
                                <span>Mã phòng ban</span>
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="code-1"
                                name="code"
                                value={formData.code}
                                onChange={(e) =>
                                    handleInputChange(
                                        "code",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="Nhập mã phòng ban (ví dụ: HR01, ENG)"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="employees" className="ml-2">
                                Thêm nhân viên
                            </Label>
                            <EmployeeSelector
                                selectedEmployees={formData.selectedEmployees}
                                onSelectionChange={
                                    handleEmployeeSelectionChange
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Hủy</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            )}
                            {isSubmitting ? "Đang tạo..." : "Tạo phòng ban"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
