"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export interface ProjectRow {
    id: string
    name: string
    memberCount: number
    startDate: string | null
    endDate: string | null
    status: "active" | "ended"
}

function formatDate(value: string | null) {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return format(date, "dd/MM/yyyy")
}

function statusLabel(status: ProjectRow["status"]) {
    return status === "active" ? "Đang hoạt động" : "Đã kết thúc"
}

export const projectsColumns: ColumnDef<ProjectRow>[] = [
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
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.status === "active" ? "outline" : "secondary"
                }
            >
                {statusLabel(row.original.status)}
            </Badge>
        ),
    },
]
