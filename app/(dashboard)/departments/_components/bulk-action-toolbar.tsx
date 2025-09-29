import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { BottomToolbar } from './bottom-toolbar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteDepartments } from '@/app/api/departments/queries'

type BulkActionToolbarProps<TData> = {
    table: Table<TData>
}

export function BulkActionToolbar<TData>({
    table,
}: BulkActionToolbarProps<TData>) {
    const [ showDeleteConfirm, setShowDeleteConfirm ] = useState(false)
    const selectedRows = table.getFilteredSelectedRowModel().rows

    const handleDelete = async () => {
        const departmentIds = selectedRows.map((row) => (row.original as any).id)
        try {
            const response = await deleteDepartments(departmentIds)
            if (!response) throw new Error('Failed to delete departments')
            toast.success('Departments deleted successfully')
            // Refresh the page or refetch data
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast.error((error as Error).message || 'Failed to delete departments')
        } finally {
            setShowDeleteConfirm(false)
            table.resetRowSelection()
        }
    }

    return (
        <>
            <BottomToolbar table={table} entityName='phòng ban'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            onClick={() => setShowDeleteConfirm(true)}
                            aria-label='Xóa các phòng ban đã chọn'
                            title='Xóa các phòng ban đã chọn'
                            className='hover:bg-destructive/80 focus:bg-destructive/10 active:bg-destructive/10 cursor-pointer'
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

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                handleConfirm={handleDelete}
                title={
                    <span className='text-destructive'>
                        <AlertTriangle
                            className='stroke-destructive me-1 inline-block'
                            size={18}
                        />{' '}
                        Xóa {selectedRows.length}{' '}
                        {selectedRows.length > 1 ? 'phòng ban' : 'phòng ban'}
                    </span>
                }
                desc={
                    <div className='space-y-4'>
                        Bạn có chắc chắn muốn xóa các phòng ban đã chọn không? <br />
                        <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác và có thể ảnh hưởng đến các nhân viên và dự án liên quan.
                    </div>
                }
                confirmText='Xác nhận xóa'
                cancelBtnText='Hủy'
                destructive
            />
        </>
    )
}