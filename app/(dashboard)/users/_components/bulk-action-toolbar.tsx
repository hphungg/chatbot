import { useState } from "react"
import { type Table } from "@tanstack/react-table"
import { Trash2, UserX, UserCheck, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { BottomToolbar } from "./bottom-toolbar"
import { User } from "@/lib/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { deleteUsers } from "@/app/api/users/queries"

type BulkActionToolbarProps<TData> = {
    table: Table<TData>
}

export function BulkActionToolbar<TData>({
    table,
}: BulkActionToolbarProps<TData>) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const selectedRows = table.getFilteredSelectedRowModel().rows

    const handleBulkStatusChange = (status: "verified" | "not-verified") => {
        const selectedUsers = selectedRows.map((row) => row.original as User)
        toast.success("In development...")
        table.resetRowSelection()
    }

    const handleDelete = async () => {
        const userIds = selectedRows.map((row) => (row.original as any).id)
        try {
            const response = await deleteUsers(userIds)
            if (!response) throw new Error("Failed to delete users")
            toast.success("Users deleted successfully")
        } catch (error) {
            console.error(error)
            toast.error((error as Error).message || "Failed to delete users")
        } finally {
            setShowDeleteConfirm(false)
        }
    }

    return (
        <>
            <BottomToolbar table={table} entityName="nhân viên">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleBulkStatusChange("verified")}
                            className="size-8"
                            aria-label="Activate selected users"
                        >
                            <UserCheck />
                            <span className="sr-only">Duyệt nhân viên</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Duyệt các nhân viên đã chọn</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                handleBulkStatusChange("not-verified")
                            }
                            className="size-8"
                            aria-label="Deactivate selected users"
                        >
                            <UserX />
                            <span className="sr-only">
                                Bỏ duyệt các nhân viên đã chọn
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Bỏ duyệt các nhân viên đã chọn</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="size-8"
                            aria-label="Delete selected users"
                        >
                            <Trash2 />
                            <span className="sr-only">
                                Xóa các nhân viên đã chọn{" "}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Xóa các nhân viên đã chọn</p>
                    </TooltipContent>
                </Tooltip>
            </BottomToolbar>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                handleConfirm={handleDelete}
                title={
                    <span className="text-destructive">
                        <AlertTriangle
                            className="stroke-destructive me-1 inline-block"
                            size={18}
                        />{" "}
                        Xóa {selectedRows.length}
                        {" nhân viên"}
                    </span>
                }
                desc={
                    <div className="space-y-4">
                        Bạn có chắc chắn muốn xóa các nhân viên đã chọn không?{" "}
                        <br />
                    </div>
                }
                confirmText="Xác nhận xóa"
                cancelBtnText="Hủy"
                destructive
            />
        </>
    )
}
