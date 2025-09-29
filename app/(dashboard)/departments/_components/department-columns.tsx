"use client";

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Department } from '@/lib/types'
import { Eye } from 'lucide-react'
import { useDepartments } from '@/context/department-context'

export const departmentsColumns: ColumnDef<Department>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
                className='translate-y-[2px]'
            />
        ),
        meta: {
            className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
        },
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: "Name",
        cell: ({ row }) => (
            <div className='w-fit text-nowrap font-medium'>{row.getValue('name')}</div>
        ),
        meta: {
            className: cn(
                'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
                'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
            ),
        },
        enableHiding: false,
    },
    {
        accessorKey: 'code',
        header: "Code",
        cell: ({ row }) => (
            <div className='w-fit text-nowrap font-bold text-sm py-1'>
                {row.getValue('code')}
            </div>
        ),
    },
    {
        accessorKey: 'employeeCount',
        header: "Total Employees",
        cell: ({ row }) => (
            <div className='w-fit text-center'>
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                    {row.getValue('employeeCount')}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'projectCount',
        header: "Total Projects",
        cell: ({ row }) => (
            <div className='w-fit text-center'>
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                    {row.getValue('projectCount')}
                </span>
            </div>
        ),
    },
    {
        id: 'actions',
        header: "Actions",
        cell: ({ row }) => {
            const department = row.original
            return (
                <DepartmentActions department={department} />
            )
        },
        meta: {
            className: cn('sticky end-0 z-10'),
        },
        enableSorting: false,
        enableHiding: false,
    },
]

function DepartmentActions({ department }: { department: Department }) {
    const { setOpen, setCurrentRow } = useDepartments()

    const handleViewDetails = () => {
        setCurrentRow(department)
        setOpen('view')
    }

    return (
        <div className='flex items-center gap-1'>
            <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className='cursor-pointer'
            >
                <Eye />
                <span className='sr-only'>View</span>
            </Button>
        </div>
    )
}