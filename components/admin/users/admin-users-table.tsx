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
import { Save } from "lucide-react"
import type {
    AdminUserRecord,
    AdminDepartmentRecord,
} from "@/app/api/admin/queries"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"

interface DepartmentOption {
    id: string
    name: string
}

interface AdminUsersTableProps {
    users: AdminUserRecord[]
    departments: AdminDepartmentRecord[]
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
    { value: "admin", label: "Quản lý" },
]

function getDepartmentName(options: DepartmentOption[], id?: string | null) {
    if (!id) return "Chưa gán"
    return options.find((item) => item.id === id)?.name ?? "Chưa gán"
}

export function AdminUsersTable({ users, departments }: AdminUsersTableProps) {
    const router = useRouter()
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
            users.map((user) => {
                const departmentId = user.departmentId ?? ""
                const departmentName =
                    user.departmentName ??
                    getDepartmentName(departmentOptions, departmentId)
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    displayName: user.displayName ?? "",
                    role: user.role,
                    departmentId,
                    departmentName,
                    userVerified: user.userVerified,
                    emailVerified: user.emailVerified,
                    isDirty: false,
                }
            }),
        [users, departmentOptions],
    )

    const [rows, setRows] = useState<AdminUserRow[]>(initialRows)
    const [searchTerm, setSearchTerm] = useState("")
    const [savingById, setSavingById] = useState<Record<string, boolean>>({})
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
        const actualValue = value === "none" ? "" : value
        const departmentName = getDepartmentName(departmentOptions, actualValue)
        markRow(id, (row) => ({
            ...row,
            departmentId: actualValue,
            departmentName,
        }))
    }

    const handleSave = async (id: string) => {
        const row = rows.find((item) => item.id === id)
        if (!row) return
        const displayName = row.displayName.trim()
        if (!displayName) {
            toast.error("Tên hiển thị không được để trống")
            return
        }
        setSavingById((prev) => ({ ...prev, [id]: true }))
        try {
            const response = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    displayName,
                    role: row.role,
                    departmentId: row.departmentId || null,
                }),
            })
            const result = await response.json().catch(() => null)
            if (!response.ok || !result || !result.user) {
                const message = result?.error ?? "Không thể lưu thay đổi"
                throw new Error(message)
            }
            const updated: AdminUserRecord = result.user
            const departmentId = updated.departmentId ?? ""
            const departmentName =
                updated.departmentName ??
                getDepartmentName(departmentOptions, departmentId)
            const nextRow: AdminUserRow = {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                displayName: updated.displayName ?? "",
                role: updated.role,
                departmentId,
                departmentName,
                userVerified: updated.userVerified,
                emailVerified: updated.emailVerified,
                isDirty: false,
            }
            setRows((prev) =>
                prev.map((existing) =>
                    existing.id === id ? nextRow : existing,
                ),
            )
            originalsRef.current.set(id, nextRow)
            toast.success(`Đã lưu thay đổi cho ${nextRow.email}`)
            router.refresh()
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể lưu thay đổi"
            toast.error(message)
        } finally {
            setSavingById((prev) => {
                const next = { ...prev }
                delete next[id]
                return next
            })
        }
    }

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Label
                        htmlFor="admin-user-search"
                        className="text-xl font-bold"
                    >
                        Danh sách người dùng
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
                                <TableHead>Tên</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tên hiển thị</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead>Phòng ban</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.length ? (
                                filteredRows.map((row) => {
                                    const isSaving = Boolean(savingById[row.id])
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.isDirty
                                                    ? "dirty"
                                                    : undefined
                                            }
                                        >
                                            <TableCell className="align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {row.name}
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
                                                    disabled={isSaving}
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
                                                    disabled={isSaving}
                                                >
                                                    <SelectTrigger className="min-w-[120px]">
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
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={
                                                        row.departmentId ||
                                                        "none"
                                                    }
                                                    onValueChange={(value) =>
                                                        handleDepartmentChange(
                                                            row.id,
                                                            value,
                                                        )
                                                    }
                                                    disabled={isSaving}
                                                >
                                                    <SelectTrigger className="min-w-[160px]">
                                                        <SelectValue placeholder="Chưa gán" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Chưa gán
                                                        </SelectItem>
                                                        {departmentOptions.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.id
                                                                    }
                                                                    value={
                                                                        option.id
                                                                    }
                                                                >
                                                                    {
                                                                        option.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {row.userVerified ? (
                                                    <Badge variant="default">
                                                        Đã xác minh
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Chưa xác minh
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSave(row.id)
                                                    }
                                                    disabled={
                                                        !row.isDirty || isSaving
                                                    }
                                                >
                                                    {isSaving ? (
                                                        <Spinner />
                                                    ) : (
                                                        <>
                                                            <Save className="mr-1 h-4 w-4" />{" "}
                                                            Lưu
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
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
            </CardContent>
        </Card>
    )
}
