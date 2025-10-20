"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createDepartmentAction } from "@/app/api/admin/departments/actions"

interface CreateDepartmentDialogProps {
    triggerLabel?: string
}

export function CreateDepartmentDialog({
    triggerLabel = "Tạo phòng ban",
}: CreateDepartmentDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (loading) return
        if (!name || !code) return
        const formattedCode = code.toUpperCase()
        setLoading(true)
        try {
            const result = await createDepartmentAction({
                name,
                code: formattedCode,
            })
            if (result?.department) {
                setName("")
                setCode("")
                setOpen(false)
                toast.success("Đã tạo phòng ban mới")
                router.refresh()
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể tạo phòng ban. Vui lòng thử lại."
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>{triggerLabel}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Tạo phòng ban mới</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin cơ bản của phòng ban để thêm vào danh
                            sách.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="admin-dept-name">
                                Tên phòng ban
                            </Label>
                            <Input
                                id="admin-dept-name"
                                placeholder="Ví dụ: Kinh doanh"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-dept-code">
                                Mã phòng ban
                            </Label>
                            <Input
                                id="admin-dept-code"
                                placeholder="Ví dụ: SALES"
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
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Đang tạo..." : "Tạo phòng ban"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
