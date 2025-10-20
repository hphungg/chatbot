"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { EditDepartmentDialog } from "./edit-department-dialog"
import { DepartmentWithStats } from "@/lib/types"

export const departmentsColumns: ColumnDef<DepartmentWithStats>[] = [
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
        header: "Tên phòng ban",
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
        accessorKey: "code",
        header: "Mã phòng ban",
        cell: ({ row }) => <Badge>{row.getValue("code")}</Badge>,
    },
    {
        accessorKey: "employeeCount",
        header: "Tổng số nhân viên",
        cell: ({ row }) => (
            <div className="w-fit text-center">
                {row.getValue("employeeCount")}
            </div>
        ),
    },
    {
        accessorKey: "projectCount",
        header: "Tổng số dự án",
        cell: ({ row }) => (
            <div className="w-fit text-center">
                {row.getValue("projectCount")}
            </div>
        ),
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            return <EditDepartmentDialog department={row.original} />
        },
    },
]
