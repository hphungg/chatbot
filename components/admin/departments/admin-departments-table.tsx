"use client"

import { useMemo, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Pencil } from "lucide-react"
import { EditableDepartment } from "@/components/admin/departments/edit-department-dialog"

interface AdminDepartmentsTableProps {
    departments: EditableDepartment[]
    onEdit: (department: EditableDepartment) => void
}

export function AdminDepartmentsTable({
    departments,
    onEdit,
}: AdminDepartmentsTableProps) {
    const [searchTerm, setSearchTerm] = useState("")

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return departments
        const term = searchTerm.toLowerCase()
        return departments.filter((department) =>
            [department.name, department.code].some((value) =>
                value.toLowerCase().includes(term),
            ),
        )
    }, [departments, searchTerm])

    return (
        <Card>
            <CardHeader className="gap-3">
                <Input
                    id="admin-department-search"
                    placeholder="Tìm kiếm theo tên hoặc mã phòng ban..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="sm:max-w-sm"
                />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên phòng ban</TableHead>
                                <TableHead>Mã</TableHead>
                                <TableHead>Nhân viên</TableHead>
                                <TableHead>Dự án</TableHead>
                                <TableHead className="text-right">
                                    Thao tác
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length ? (
                                filtered.map((department) => (
                                    <TableRow key={department.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {department.name}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    ID:{" "}
                                                    {department.id.slice(0, 6)}
                                                    ...
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge>{department.code}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {department.employeeCount ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            {department.projectCount ?? 0}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    onEdit(department)
                                                }
                                            >
                                                <Pencil className="mr-1 h-4 w-4" />{" "}
                                                Cập nhật
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-14 text-center"
                                    >
                                        Không tìm thấy phòng ban phù hợp.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <p className="text-muted-foreground text-xs">
                    Các thao tác hiện chỉ mang tính minh họa và chưa kết nối với
                    dữ liệu thực tế.
                </p>
            </CardContent>
        </Card>
    )
}
