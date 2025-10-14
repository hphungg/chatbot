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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    const [role, setRole] = useState(roles[0].value)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedEmail = email.trim().toLowerCase()
        if (!trimmedEmail) return
        setLoading(true)
        try {
            const response = await fetch("/api/admin/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmedEmail, role }),
            })
            const result = await response.json().catch(() => null)
            if (!response.ok) {
                const message = result?.error ?? "Không thể gửi lời mời"
                throw new Error(message)
            }
            toast.success(`Đã gửi lời mời tới ${trimmedEmail}`)
            setEmail("")
            setRole(roles[0].value)
            setOpen(false)
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Không thể gửi lời mời"
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
                        <DialogTitle>Mời người dùng mới</DialogTitle>
                        <DialogDescription>
                            Gửi lời mời tới email của người dùng mới.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                            id="invite-email"
                            type="email"
                            placeholder="example@company.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="invite-role">Vai trò</Label>
                        <Select
                            value={role}
                            onValueChange={setRole}
                            disabled={loading}
                        >
                            <SelectTrigger id="invite-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2">
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
