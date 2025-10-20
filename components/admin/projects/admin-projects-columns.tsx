"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ProjectWithStats } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

function formatDate(value: string | null) {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return format(date, "dd/MM/yyyy")
}

export const adminProjectColumns: ColumnDef<ProjectWithStats>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Tên dự án",
        cell: ({ row }) => (
            <div className="w-fit font-medium text-nowrap">
                {row.getValue("name")}
            </div>
        ),
        enableHiding: false,
    },
    {
        accessorKey: "departmentNames",
        header: "Phòng ban",
        cell: ({ row }) => {
            const names = row.getValue("departmentNames") as string[]
            return (
                <div className="w-fit font-medium text-nowrap">
                    {names?.length ? names.join(", ") : "Không"}
                </div>
            )
        },
        enableHiding: false,
    },
    {
        accessorKey: "memberCount",
        header: "Số thành viên",
        cell: ({ row }) => <div>{row.getValue("memberCount")}</div>,
    },
    {
        accessorKey: "startDate",
        header: "Ngày bắt đầu",
        cell: ({ row }) => <div>{formatDate(row.getValue("startDate"))}</div>,
    },
    {
        accessorKey: "endDate",
        header: "Ngày kết thúc",
        cell: ({ row }) => <div>{formatDate(row.getValue("endDate"))}</div>,
    },
]
