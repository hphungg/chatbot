import { type ColumnDef } from "@tanstack/react-table"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

const getRoleText = (role: string) => {
    switch (role) {
        case "boss":
            return "Admin"
        case "admin":
            return "Quản trị viên"
        case "manager":
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

export const usersColumns: ColumnDef<UserWithDepartment>[] = [
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
                    Tên
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
        accessorKey: "role",
        header: "Vai trò",
        cell: ({ row }) => <div>{getRoleText(row.getValue("role"))}</div>,
    },
    {
        accessorKey: "department",
        header: "Phòng ban",
        cell: ({ row }) => {
            const department = row.original.department
            return <div>{department?.name || "Chưa có phòng ban"}</div>
        },
    },
]
