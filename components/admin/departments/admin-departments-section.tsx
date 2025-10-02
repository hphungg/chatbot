"use client"

import { useMemo, useState } from "react"
import {
    EditableDepartment,
    EditDepartmentDialog,
} from "@/components/admin/departments/edit-department-dialog"
import { CreateDepartmentDialog } from "@/components/admin/departments/create-department-dialog"
import { AdminDepartmentsTable } from "@/components/admin/departments/admin-departments-table"
import { toast } from "sonner"

interface AdminDepartmentsSectionProps {
    departments: EditableDepartment[]
}

export function AdminDepartmentsSection({
    departments,
}: AdminDepartmentsSectionProps) {
    const [items, setItems] = useState<EditableDepartment[]>(() =>
        departments.map((department) => ({ ...department })),
    )
    const [selected, setSelected] = useState<EditableDepartment | null>(null)
    const [open, setOpen] = useState(false)

    const sortedDepartments = useMemo(
        () =>
            [...items].sort((a, b) =>
                a.name.localeCompare(b.name, "vi", { sensitivity: "base" }),
            ),
        [items],
    )

    const handleCreate = (department: {
        id: string
        name: string
        code: string
    }) => {
        setItems((prev) => [
            {
                id: department.id,
                name: department.name,
                code: department.code,
                employeeCount: 0,
                projectCount: 0,
            },
            ...prev,
        ])
    }

    const handleEdit = (department: EditableDepartment) => {
        setSelected(department)
        setOpen(true)
    }

    const handleSave = (department: EditableDepartment) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === department.id ? { ...item, ...department } : item,
            ),
        )
        toast.success("Đã cập nhật thông tin phòng ban")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Kiểm duyệt phòng ban
                    </h1>
                    <p className="text-muted-foreground">
                        Phê duyệt yêu cầu và quản lý cấu trúc phòng ban của
                        doanh nghiệp.
                    </p>
                </div>
                <CreateDepartmentDialog onCreate={handleCreate} />
            </div>
            <AdminDepartmentsTable
                departments={sortedDepartments}
                onEdit={handleEdit}
            />
            <EditDepartmentDialog
                department={selected}
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
            />
        </div>
    )
}
