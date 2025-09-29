"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDepartments } from "@/app/(dashboard)/departments/_components/department-context"
import { EmployeeSelector } from "./employee-selector"
import { createDepartment } from "@/app/api/departments/queries"

export function CreateDepartmentDialog() {
    const { open, setOpen } = useDepartments()
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        selectedEmployees: [] as string[],
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isOpen = open === "add"

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
            toast.error("Please fill in all required fields")
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
            window.location.reload()
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo phòng ban mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin bên dưới.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-5 items-center gap-2">
                            <Label htmlFor="name" className="text-right">
                                <span>Tên</span>
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                }
                                placeholder="Nhập tên phòng ban"
                                className="col-span-4"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-5 items-center gap-2">
                            <Label htmlFor="code">
                                <span>Mã</span>
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) =>
                                    handleInputChange(
                                        "code",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="Nhập mã phòng ban (ví dụ: HR01, ENG)"
                                className="col-span-4"
                                maxLength={10}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-7 items-center gap-4">
                            <Label htmlFor="employees" className="col-span-2">
                                Thêm nhân viên
                            </Label>
                            <div className="col-span-5">
                                <EmployeeSelector
                                    selectedEmployees={
                                        formData.selectedEmployees
                                    }
                                    onSelectionChange={
                                        handleEmployeeSelectionChange
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="gap-2"
                        >
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
