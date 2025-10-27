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
import { toast } from "sonner"

interface InviteUserDialogProps {
    triggerLabel?: string
}

export function InviteUserDialog({
    triggerLabel = "Mời người dùng",
}: InviteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
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
                body: JSON.stringify({ email: trimmedEmail }),
            })
            const result = await response.json().catch(() => null)
            if (!response.ok) {
                const message = result?.error ?? "Không thể gửi lời mời"
                throw new Error(message)
            }
            toast.success(`Đã gửi lời mời tới ${trimmedEmail}`)
            setEmail("")
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
