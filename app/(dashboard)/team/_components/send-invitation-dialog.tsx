"use client"

import { useState, useTransition } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail } from "lucide-react"
import { sendInvitationEmail } from "@/app/api/team/queries"
import { toast } from "sonner"

export function SendInvitationDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    const handleSend = () => {
        if (!email || !message) {
            toast.error("Vui lòng điền đầy đủ thông tin")
            return
        }

        startTransition(async () => {
            try {
                await sendInvitationEmail(email, message)
                toast.success("Đã gửi email mời thành công")
                setOpen(false)
                setEmail("")
                setMessage("")
            } catch (error: any) {
                toast.error(error.message || "Không thể gửi email mời")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Mail className="mr-2 size-4" />
                    Mời
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Gửi lời mời qua email</DialogTitle>
                    <DialogDescription>
                        Điền địa chỉ email và nội dung mời để gửi lời mời vào
                        phòng ban
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Nội dung</Label>
                        <Textarea
                            id="message"
                            placeholder="Nhập nội dung lời mời..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isPending}
                            rows={5}
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={isPending}
                        className="w-full"
                    >
                        {isPending ? "Đang gửi..." : "Gửi"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
