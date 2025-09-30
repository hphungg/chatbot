"use client"

import { useEffect, useState } from "react"
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
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./pagination"
import { BulkActionToolbar } from "./bulk-action-toolbar"
import { departmentsColumns as columns } from "./department-columns"
import { Department } from "@/lib/types"
import { getAllDepartments } from "@/app/api/departments/queries"

declare module "@tanstack/react-table" {
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
                const response = await getAllDepartments()
                setDepartments(response)
            } catch (error) {
                console.error("Error fetching departments:", error)
                setError("Failed to fetch departments")
            } finally {
                setLoading(false)
            }
        }
        fetchDepartments()
    }, [])

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
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <div className="bg-muted h-4 w-4 animate-pulse rounded" />
                                </TableHead>
                                <TableHead>
                                    <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                                </TableHead>
                                <TableHead>
                                    <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                                </TableHead>
                                <TableHead>
                                    <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                                </TableHead>
                                <TableHead>
                                    <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                                </TableHead>
                                <TableHead>
                                    <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="bg-muted h-4 w-4 animate-pulse rounded" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="bg-muted h-4 w-8 animate-pulse rounded" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="bg-muted h-4 w-8 animate-pulse rounded" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="bg-muted h-8 w-8 animate-pulse rounded" />
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
                <div className="overflow-hidden rounded-md border">
                    <div className="p-8 text-center">
                        <p className="text-muted-foreground">Error: {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-primary mt-4 hover:underline"
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
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="group/row"
                            >
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(
                                                "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                                                header.column.columnDef.meta
                                                    ?.className ?? "",
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
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
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    className="group/row"
                                >
                                    {row.getAllCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted cursor-pointer",
                                                cell.column.columnDef.meta
                                                    ?.className ?? "",
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Không có dữ liệu.
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
