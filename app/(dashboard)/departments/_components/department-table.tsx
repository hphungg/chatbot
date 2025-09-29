"use client"

import { useEffect, useState } from 'react'
import {
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'
import { BulkActionToolbar } from './bulk-action-toolbar'
import { departmentsColumns as columns } from './department-columns'
import { Department } from '@/lib/types'
import { getAllDepartments } from '@/app/api/departments/queries'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData, TValue> {
        className: string
    }
}

export function DepartmentsTable() {
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchDepartments() {
            try {
                setLoading(true)
                setError(null)
                const response = await getAllDepartments();
                setDepartments(response);
            } catch (error) {
                console.error("Error fetching departments:", error);
                setError("Failed to fetch departments")
            } finally {
                setLoading(false)
            }
        }
        fetchDepartments();
    }, []);

    const table = useReactTable({
        data: departments,
        columns,
        state: {
            sorting,
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getPaginationRowModel: getPaginationRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    if (loading) {
        return (
            <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
                <div className='overflow-hidden rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                                </TableHead>
                                <TableHead>
                                    <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                                </TableHead>
                                <TableHead>
                                    <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                                </TableHead>
                                <TableHead>
                                    <div className="w-28 h-4 bg-muted rounded animate-pulse" />
                                </TableHead>
                                <TableHead>
                                    <div className="w-28 h-4 bg-muted rounded animate-pulse" />
                                </TableHead>
                                <TableHead>
                                    <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-8 h-4 bg-muted rounded animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-8 h-4 bg-muted rounded animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
                <div className='overflow-hidden rounded-md border'>
                    <div className="p-8 text-center">
                        <p className="text-muted-foreground">Error: {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='group/row'>
                                {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={cn(
                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                            header.column.columnDef.meta?.className ?? ''
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        }
                                    </TableHead>
                                )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className='group/row'
                                >
                                    {row.getAllCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted cursor-pointer',
                                                cell.column.columnDef.meta?.className ?? ''
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    No departments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
            <BulkActionToolbar table={table} />
        </div>
    )
}