"use client"

import { useMemo, useState } from "react"
import {
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"
import { projectsColumns } from "./columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useProjectsContext } from "./context"
import type { ProjectRow } from "./columns"

interface ProjectsTableProps {
    type: "active" | "ended"
    emptyMessage: string
}

export function ProjectsTable({ type, emptyMessage }: ProjectsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const { projects, selectedProjectId, openMembers } = useProjectsContext()

    const rows = useMemo<ProjectRow[]>(() => {
        const now = Date.now()
        return projects
            .map((project) => {
                const endTime = project.endDate ? new Date(project.endDate).getTime() : null
                const status: ProjectRow["status"] = endTime !== null && endTime < now ? "ended" : "active"
                return {
                    id: project.id,
                    name: project.name,
                    memberCount: project.members.length,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    status,
                }
            })
            .filter((project) => project.status === type)
    }, [projects, type])

    const table = useReactTable({
        data: rows,
        columns: projectsColumns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="w-full">
            <Input
                placeholder="Tìm kiếm dự án..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="mb-4 max-w-sm"
            />

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {
                                const isSelected = row.original.id === selectedProjectId
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={isSelected ? "selected" : undefined}
                                        className="cursor-pointer"
                                        onClick={() => openMembers(row.original.id)}
                                    >
                                        {row.getAllCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={projectsColumns.length}
                                    className="h-12 text-center"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between space-y-2 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    {table.getFilteredRowModel().rows.length} kết quả
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Trang trước
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Trang sau
                    </Button>
                </div>
            </div>
        </div>
    )
}
