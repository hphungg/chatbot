"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MockProject } from "../_data/mock-projects"

function formatDate(date?: string) {
    if (!date) return "-"
    try {
        return format(new Date(date), "dd/MM/yyyy")
    } catch {
        return date
    }
}

export const projectsColumns: ColumnDef<MockProject>[] = [
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
                className="translate-y-[2px]"
            />
        ),
        meta: {
            className: cn(
                "sticky md:table-cell start-0 z-10 rounded-tl-[inherit]",
            ),
        },
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
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
        meta: {
            className: cn(
                "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
                "sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none",
            ),
        },
        enableHiding: false,
    },
    {
        accessorKey: "members",
        header: "Số thành viên",
        cell: ({ row }) => <div>{row.getValue("members")}</div>,
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
