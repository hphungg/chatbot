"use client"

import { useState } from "react"
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

interface CreateDepartmentDialogProps {
    onCreate: (department: { id: string; name: string; code: string }) => void
}

export function CreateDepartmentDialog({
    onCreate,
}: CreateDepartmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!name || !code) return
        setLoading(true)
        setTimeout(() => {
            const newDepartment = {
                id: `tmp-${Date.now()}`,
                name,
                code: code.toUpperCase(),
            }
            onCreate(newDepartment)
            toast.success("Đã tạo phòng ban mới")
            setName("")
            setCode("")
            setLoading(false)
            setOpen(false)
        }, 500)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Tạo phòng ban</Button>
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
                                    setCode(event.target.value)
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
