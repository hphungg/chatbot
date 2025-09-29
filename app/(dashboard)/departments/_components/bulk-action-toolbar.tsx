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
import { Department } from '@/lib/types'
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
            <BottomToolbar table={table} entityName='department'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            onClick={() => setShowDeleteConfirm(true)}
                            aria-label='Delete selected departments'
                            title='Delete selected departments'
                            className='hover:bg-destructive/80 focus:bg-destructive/10 active:bg-destructive/10 cursor-pointer'
                        >
                            <Trash2 />
                            <span>Delete</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete selected departments</p>
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
                        Delete {selectedRows.length}{' '}
                        {selectedRows.length > 1 ? 'departments' : 'department'}
                    </span>
                }
                desc={
                    <div className='space-y-4'>
                        Are you sure you want to delete the selected departments? <br />
                        <strong>Warning:</strong> This action cannot be undone and may affect associated users and projects.
                    </div>
                }
                confirmText='Delete'
                destructive
            />
        </>
    )
}