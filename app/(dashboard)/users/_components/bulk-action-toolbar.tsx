import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { BottomToolbar } from './bottom-toolbar'
import { User } from '@/lib/types'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteUsers } from '@/app/api/users/route'

type BulkActionToolbarProps<TData> = {
    table: Table<TData>
}

export function BulkActionToolbar<TData>({
    table,
}: BulkActionToolbarProps<TData>) {
    const [ showDeleteConfirm, setShowDeleteConfirm ] = useState(false)
    const selectedRows = table.getFilteredSelectedRowModel().rows

    const handleBulkStatusChange = (status: 'verified' | 'not-verified') => {
        const selectedUsers = selectedRows.map((row) => row.original as User)
        toast.promise(sleep(2000), {
            loading: `${status === 'verified' ? 'Verifying' : 'Unverifying'} users...`,
            success: () => {
                table.resetRowSelection()
                return `${status === 'verified' ? 'Verified' : 'Unverified'} ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
            },
            error: `Error ${status === 'verified' ? 'verifying' : 'unverifying'} users`,
        })
        table.resetRowSelection()
    }

    const handleDelete = async () => {
        const userIds = selectedRows.map((row) => (row.original as any).id)
        try {
            const response = await deleteUsers(userIds)
            if (!response) throw new Error('Failed to delete users')
            toast.success('Users deleted successfully')
        } catch (error) {
            console.error(error)
            toast.error((error as Error).message || 'Failed to delete users')
        } finally {
            setShowDeleteConfirm(false)
        }
    }

    return (
        <>
            <BottomToolbar table={table} entityName='user'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleBulkStatusChange('verified')}
                            className='size-8'
                            aria-label='Activate selected users'
                            title='Activate selected users'
                        >
                            <UserCheck />
                            <span className='sr-only'>Verify selected users</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Verify selected users</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleBulkStatusChange('not-verified')}
                        className='size-8'
                        aria-label='Deactivate selected users'
                        title='Deactivate selected users'
                    >
                        <UserX />
                        <span className='sr-only'>Unverify selected users</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Unverify selected users</p>
                </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => setShowDeleteConfirm(true)}
                            className='size-8'
                            aria-label='Delete selected users'
                            title='Delete selected users'
                        >
                            <Trash2 />
                            <span className='sr-only'>Delete selected users</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete selected users</p>
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
                        {selectedRows.length > 1 ? 'users' : 'user'}
                    </span>
                }
                desc={
                    <div className='space-y-4'>
                        Are you sure you want to delete the selected users? <br />
                    </div>
                }
                confirmText='Delete'
                destructive
            />
        </>
    )
}