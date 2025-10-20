"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deleteMultipleUsersAction } from "@/app/api/admin/users/actions"
import { Trash2 } from "lucide-react"

interface DeleteSelectedUsersButtonProps {
    selectedUserIds: string[]
    onComplete?: () => void
}

export function DeleteSelectedUsersButton({
    selectedUserIds,
    onComplete,
}: DeleteSelectedUsersButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteMultipleUsersAction(selectedUserIds)
            toast.success(
                `Đã xóa ${selectedUserIds.length} người dùng thành công`,
            )
            setOpen(false)
            onComplete?.()
        } catch (error) {
            console.error("Error deleting users:", error)
            toast.error("Đã xảy ra lỗi khi xóa người dùng")
        } finally {
            setLoading(false)
        }
    }

    if (selectedUserIds.length === 0) return null

    return (
        <>
            <Button
                variant="destructive"
                onClick={() => setOpen(true)}
                disabled={loading}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa ({selectedUserIds.length})
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa người dùng
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa {selectedUserIds.length}{" "}
                            người dùng đã chọn? Hành động này không thể hoàn
                            tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
