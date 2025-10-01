import { useState } from "react"
import { useRouter } from "next/navigation"
import { type Table } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { BottomToolbar } from "./bottom-toolbar"
import { deleteDepartments } from "@/app/api/departments/queries"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type DeleteDepartmentDialogProps<TData> = {
    table: Table<TData>
}

export function DeleteDepartmentDialog<TData>({
    table,
}: DeleteDepartmentDialogProps<TData>) {
    const router = useRouter()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const selectedRows = table.getFilteredSelectedRowModel().rows

    const handleDelete = async () => {
        setLoading(true)
        const departmentIds = selectedRows.map(
            (row) => (row.original as any).id,
        )
        try {
            const response = await deleteDepartments(departmentIds)
            if (!response) throw new Error("Failed to delete departments")
            toast.success("Xóa phòng ban thành công")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error(
                (error as Error).message || "Failed to delete departments",
            )
        } finally {
            setShowDeleteConfirm(false)
            setLoading(false)
            table.resetRowSelection()
        }
    }

    return (
        <>
            <BottomToolbar table={table} entityName="phòng ban">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                            aria-label="Xóa các phòng ban đã chọn"
                            title="Xóa các phòng ban đã chọn"
                            className="hover:bg-destructive/80 focus:bg-destructive/10 active:bg-destructive/10 cursor-pointer"
                        >
                            <Trash2 />
                            <span>Xóa</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Xóa {selectedRows.length} phòng ban đã chọn</p>
                    </TooltipContent>
                </Tooltip>
            </BottomToolbar>

            <Dialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Xóa {selectedRows.length} phòng ban?
                        </DialogTitle>
                        <DialogDescription>
                            Hành động này không thể hoàn tác. Tất cả dữ liệu
                            liên quan đến phòng ban sẽ bị xóa vĩnh viễn.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="hover:bg-destructive/80 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Đang xóa..." : "Xác nhận xóa"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
