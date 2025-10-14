"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import { updateDepartmentAction } from "@/app/api/admin/departments/actions"

export interface EditableDepartment {
    id: string
    name: string
    code: string
    employeeCount?: number | null
    projectCount?: number | null
}

interface EditDepartmentDialogProps {
    department: EditableDepartment | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (department: EditableDepartment) => void
}

export function EditDepartmentDialog({
    department,
    open,
    onOpenChange,
    onSave,
}: EditDepartmentDialogProps) {
    const router = useRouter()
    const [name, setName] = useState("")
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (department) {
            setName(department.name)
            setCode(department.code)
        }
    }, [department])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (loading || !department) return
        setLoading(true)
        try {
            const result = await updateDepartmentAction({
                departmentId: department.id,
                name,
                code: code.toUpperCase(),
            })
            if (result?.department) {
                onSave(result.department)
                toast.success("Đã cập nhật thông tin phòng ban")
                onOpenChange(false)
                router.refresh()
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật phòng ban. Vui lòng thử lại."
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Cập nhật phòng ban</DialogTitle>
                        <DialogDescription>
                            Điều chỉnh tên và mã phòng ban. Thay đổi này chỉ áp
                            dụng trên giao diện minh họa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="admin-edit-dept-name">
                                Tên phòng ban
                            </Label>
                            <Input
                                id="admin-edit-dept-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-edit-dept-code">
                                Mã phòng ban
                            </Label>
                            <Input
                                id="admin-edit-dept-code"
                                value={code}
                                onChange={(event) =>
                                    setCode(event.target.value.toUpperCase())
                                }
                                className="uppercase"
                                required
                            />
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
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
