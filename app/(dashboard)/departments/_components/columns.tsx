"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useDepartments } from "@/app/(dashboard)/departments/_components/context"
import { Department } from "@prisma/client"
import { Badge } from "@/components/ui/badge"

export const departmentsColumns: ColumnDef<Department>[] = [
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
        cell: ({ row }) => {
            const department = row.original
            return <DepartmentActions department={department} />
        },
    },
]

function DepartmentActions({ department }: { department: Department }) {
    const { setOpen, setCurrentRow } = useDepartments()

    const handleViewDetails = () => {
        setCurrentRow(department)
        setOpen("view")
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="cursor-pointer"
            >
                <Pencil />
                <span className="sr-only">Xem</span>
            </Button>
        </div>
    )
}
