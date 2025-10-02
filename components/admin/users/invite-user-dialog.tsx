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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface InviteUserDialogProps {
    triggerLabel?: string
}

const roles = [
    { value: "employee", label: "Nhân viên" },
    { value: "manager", label: "Quản lý" },
    { value: "director", label: "Giám đốc" },
    { value: "admin", label: "Quản trị viên" },
]

export function InviteUserDialog({
    triggerLabel = "Mời người dùng",
}: InviteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("employee")
    const [loading, setLoading] = useState(false)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!email) return
        setLoading(true)
        setTimeout(() => {
            toast.success("Đã tạo lời mời gửi tới " + email)
            setEmail("")
            setRole("employee")
            setLoading(false)
            setOpen(false)
        }, 600)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>{triggerLabel}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Mời người dùng mới</DialogTitle>
                        <DialogDescription>
                            Nhập địa chỉ email và vai trò để gửi lời mời tham
                            gia.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="admin-invite-email">Email</Label>
                            <Input
                                id="admin-invite-email"
                                type="email"
                                placeholder="example@company.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger id="admin-invite-role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((item) => (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            {loading ? "Đang gửi..." : "Gửi lời mời"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
