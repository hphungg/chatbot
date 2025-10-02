"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { RotateCcw, Save } from "lucide-react"
import { User, Department } from "@prisma/client"

interface DepartmentOption {
    id: string
    name: string
}

interface AdminUsersTableProps {
    users: User[]
    departments: Department[]
}

interface AdminUserRow {
    id: string
    name: string
    email: string
    displayName: string
    role: string
    departmentId: string
    departmentName: string
    userVerified: boolean
    emailVerified: boolean
    isDirty: boolean
}

const roleOptions = [
    { value: "employee", label: "Nhân viên" },
    { value: "manager", label: "Quản lý" },
    { value: "director", label: "Giám đốc" },
    { value: "admin", label: "Quản trị viên" },
]

function getDepartmentName(options: DepartmentOption[], id: string) {
    if (!id) return "Chưa gán"
    return options.find((item) => item.id === id)?.name ?? "Chưa gán"
}

export function AdminUsersTable({ users, departments }: AdminUsersTableProps) {
    const departmentOptions = useMemo<DepartmentOption[]>(
        () =>
            departments.map((department) => ({
                id: department.id,
                name: department.name,
            })),
        [departments],
    )

    const initialRows = useMemo<AdminUserRow[]>(
        () =>
            users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                displayName: user.displayName ?? "",
                role: user.role,
                departmentId: user.departmentId ?? "",
                departmentName: getDepartmentName(
                    departmentOptions,
                    user.departmentId ?? "",
                ),
                userVerified: user.userVerified,
                emailVerified: user.emailVerified,
                isDirty: false,
            })),
        [users, departmentOptions],
    )

    const [rows, setRows] = useState<AdminUserRow[]>(initialRows)
    const [searchTerm, setSearchTerm] = useState("")
    const originalsRef = useRef<Map<string, AdminUserRow>>(new Map())

    useEffect(() => {
        setRows(initialRows)
        originalsRef.current = new Map(initialRows.map((row) => [row.id, row]))
    }, [initialRows])

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows
        const term = searchTerm.toLowerCase()
        return rows.filter((row) =>
            [row.name, row.email, row.displayName, row.departmentName].some(
                (value) => value.toLowerCase().includes(term),
            ),
        )
    }, [rows, searchTerm])

    const markRow = (
        id: string,
        updater: (row: AdminUserRow) => AdminUserRow,
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row
                const updated = updater(row)
                const original = originalsRef.current.get(id)
                if (!original) {
                    return { ...updated, isDirty: true }
                }
                const hasChanged =
                    updated.displayName !== original.displayName ||
                    updated.role !== original.role ||
                    updated.departmentId !== original.departmentId
                return { ...updated, isDirty: hasChanged }
            }),
        )
    }

    const handleDisplayNameChange = (id: string, value: string) => {
        markRow(id, (row) => ({ ...row, displayName: value }))
    }

    const handleRoleChange = (id: string, value: string) => {
        markRow(id, (row) => ({ ...row, role: value }))
    }

    const handleDepartmentChange = (id: string, value: string) => {
        const departmentName = getDepartmentName(departmentOptions, value)
        markRow(id, (row) => ({ ...row, departmentId: value, departmentName }))
    }

    const handleReset = (id: string) => {
        const original = originalsRef.current.get(id)
        if (!original) return
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...original } : row)),
        )
    }

    const handleSave = (id: string) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row
                const updated = { ...row, isDirty: false }
                originalsRef.current.set(id, updated)
                toast.success(`Đã lưu thay đổi cho ${row.email}`)
                return updated
            }),
        )
    }

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Label
                        htmlFor="admin-user-search"
                        className="text-sm font-medium"
                    >
                        Tìm kiếm
                    </Label>
                    <Input
                        id="admin-user-search"
                        placeholder="Lọc theo tên, email, phòng ban..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="sm:max-w-xs"
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên đầy đủ</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tên hiển thị</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead>Phòng ban</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">
                                    Thao tác
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.length ? (
                                filteredRows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.isDirty ? "dirty" : undefined
                                        }
                                    >
                                        <TableCell className="align-top">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {row.name}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    ID: {row.id.slice(0, 6)}...
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <span className="lowercase">
                                                {row.email}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={row.displayName}
                                                onChange={(event) =>
                                                    handleDisplayNameChange(
                                                        row.id,
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Tên hiển thị"
                                                className="min-w-[180px]"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={row.role}
                                                onValueChange={(value) =>
                                                    handleRoleChange(
                                                        row.id,
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="min-w-[160px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roleOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={row.departmentId}
                                                onValueChange={(value) =>
                                                    handleDepartmentChange(
                                                        row.id,
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="min-w-[180px]">
                                                    <SelectValue placeholder="Chưa gán" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unsigned">
                                                        Chưa gán
                                                    </SelectItem>
                                                    {departmentOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={option.id}
                                                                value={
                                                                    option.id
                                                                }
                                                            >
                                                                {option.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            {row.userVerified ||
                                            row.emailVerified ? (
                                                <Badge variant="default">
                                                    Đã xác minh
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Chưa xác minh
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleReset(row.id)
                                                    }
                                                    disabled={!row.isDirty}
                                                >
                                                    <RotateCcw className="mr-1 h-4 w-4" />{" "}
                                                    Hoàn tác
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSave(row.id)
                                                    }
                                                    disabled={!row.isDirty}
                                                >
                                                    <Save className="mr-1 h-4 w-4" />{" "}
                                                    Lưu
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-14 text-center"
                                    >
                                        Không tìm thấy người dùng phù hợp.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <p className="text-muted-foreground text-xs">
                    Lưu ý: Các thao tác chỉnh sửa hiện chỉ được lưu ở giao diện
                    mẫu và chưa kết nối với hệ thống dữ liệu.
                </p>
            </CardContent>
        </Card>
    )
}
