"use client"

import { User, Department } from "@prisma/client"
import { InviteUserDialog } from "@/components/admin/users/invite-user-dialog"
import { AdminUsersTable } from "@/components/admin/users/admin-users-table"

interface AdminUsersSectionProps {
    users: User[]
    departments: Department[]
}

export function AdminUsersSection({
    users,
    departments,
}: AdminUsersSectionProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Quản lý người dùng
                    </h1>
                    <p className="text-muted-foreground">
                        Xem và điều chỉnh thông tin người dùng trong toàn bộ tổ
                        chức.
                    </p>
                </div>
                <InviteUserDialog />
            </div>
            <AdminUsersTable users={users} departments={departments} />
        </div>
    )
}
