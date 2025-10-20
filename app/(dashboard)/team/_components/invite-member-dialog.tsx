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
import { UserPlus } from "lucide-react"
import {
    getAvailableUsersToInvite,
    inviteMemberToDepartment,
} from "@/app/api/team/queries"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function AddEmployeeDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [availableUsers, setAvailableUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            setLoading(true)
            try {
                const users = await getAvailableUsersToInvite()
                setAvailableUsers(users)
            } catch (error) {
                console.error(error)
                toast.error("Không thể tải danh sách người dùng")
            } finally {
                setLoading(false)
            }
        }
    }

    const handleInvite = (userId: string) => {
        startTransition(async () => {
            try {
                await inviteMemberToDepartment(userId)
                toast.success("Đã thêm nhân viên vào phòng ban")
                setOpen(false)
                router.refresh()
            } catch (error: any) {
                toast.error(error.message || "Không thể thêm nhân viên")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 size-4" />
                    Thêm nhân viên
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Thêm nhân viên</DialogTitle>
                    <DialogDescription>
                        Thêm nhân viên vào phòng ban của bạn.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                    {loading ? (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                            Đang tải...
                        </div>
                    ) : availableUsers.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                            Không có nhân viên nào khả dụng
                        </div>
                    ) : (
                        availableUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div>
                                    <div className="font-medium">
                                        {user.displayName || user.name}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {user.email}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleInvite(user.id)}
                                    disabled={isPending}
                                >
                                    Thêm
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
