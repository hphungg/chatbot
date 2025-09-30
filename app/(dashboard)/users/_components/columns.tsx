import { type ColumnDef } from "@tanstack/react-table"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const getRoleText = (role: string) => {
    switch (role) {
        case "admin":
            return "Quản trị viên"
        case "employee":
            return "Nhân viên"
        case "director":
            return "Giám đốc"
        default:
            return "Không xác định"
    }
}

export const usersColumns: ColumnDef<User>[] = [
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
                    Tên
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div className="ml-3">{row.getValue("name")}</div>,
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
        accessorKey: "isVerified",
        header: "Trạng thái",
        cell: ({ row }) => (
            <div>
                {row.getValue("isVerified") ? "Đã duyệt" : "Chưa được duyệt"}
            </div>
        ),
    },
]
