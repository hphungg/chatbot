"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export interface ProjectRow {
    id: string
    name: string
    departmentNames: string[]
    memberCount: number
    startDate: string | null
    endDate: string | null
}

function formatDate(value: string | null) {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return format(date, "dd/MM/yyyy")
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
        accessorKey: "departmentNames",
        header: "Phòng ban tham gia",
        cell: ({ row }) => {
            const departments = row.original.departmentNames
            return (
                <div className="flex flex-wrap gap-1">
                    {departments.length > 0 ? (
                        departments.map((dept, index) => (
                            <Badge key={index} variant="outline">
                                {dept}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">Chưa có</span>
                    )}
                </div>
            )
        },
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
