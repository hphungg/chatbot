import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { getAdminUsers, getAdminDepartments } from "@/app/api/admin/queries"
import { AdminUsersTable } from "@/components/admin/users/admin-users-table"

export default async function AdminUsersPage() {
    const [users, departments] = await Promise.all([
        getAdminUsers(),
        getAdminDepartments(),
    ])

    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Quản lý người dùng
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <AdminUsersTable users={users} departments={departments} />
            </div>
        </>
    )
}
