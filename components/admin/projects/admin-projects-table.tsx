"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { AdminProjectItem } from "./types"

interface AdminProjectsTableProps {
    projects: AdminProjectItem[]
    onEdit: (project: AdminProjectItem) => void
    onDelete: (project: AdminProjectItem) => void
    disableActions?: boolean
}

function formatDate(value: string | null) {
    if (!value) return "Chưa đặt"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return "Không hợp lệ"
    }
    return date.toLocaleDateString("vi-VN")
}

export function AdminProjectsTable({
    projects,
    onEdit,
    onDelete,
    disableActions,
}: AdminProjectsTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên dự án</TableHead>
                        <TableHead>Phòng ban</TableHead>
                        <TableHead>Thành viên</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.length ? (
                        projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {project.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            ID: {project.id.slice(0, 6)}...
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {project.departmentName ?? "Chưa phân bổ"}
                                </TableCell>
                                <TableCell>{project.memberCount}</TableCell>
                                <TableCell>
                                    {formatDate(project.startDate)}
                                </TableCell>
                                <TableCell>
                                    {formatDate(project.endDate)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(project)}
                                            disabled={disableActions}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDelete(project)}
                                            disabled={disableActions}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-14 text-center">
                                Hiện chưa có dự án nào.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
