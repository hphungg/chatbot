import { type ColumnDef } from "@tanstack/react-table"
import { Department, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { EditUserDialog } from "./edit-user-dialog"

const getRoleText = (role: string) => {
    switch (role) {
        case "admin":
            return "Quản lý"
        case "employee":
            return "Nhân viên"
        default:
            return "Không xác định"
    }
}

type UserWithDepartment = User & {
    department?: {
        id: string
        name: string
        code: string
    } | null
}

export const getAdminUserColumns = (
    departments: Department[],
): ColumnDef<UserWithDepartment>[] => [
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
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Tên người dùng
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div className="ml-3">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "displayName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Tên hiển thị
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="ml-3">{row.getValue("displayName")}</div>
        ),
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Email
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="ml-3 lowercase">{row.getValue("email")}</div>
        ),
    },
    {
        accessorKey: "department",
        header: "Phòng ban",
        cell: ({ row }) => {
            const department = row.original.department
            return <div>{department?.name || "Chưa có phòng ban"}</div>
        },
    },
    {
        accessorKey: "role",
        header: "Vai trò",
        cell: ({ row }) => <div>{getRoleText(row.getValue("role"))}</div>,
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            return (
                <EditUserDialog user={row.original} departments={departments} />
            )
        },
    },
]

export const adminUserColumns: ColumnDef<UserWithDepartment>[] = []
