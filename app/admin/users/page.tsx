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
            <div className="-mx-4 flex-1 space-y-8 overflow-auto p-4 px-4 py-1 sm:p-6 lg:p-8">
                <AdminUsersTable users={users} departments={departments} />
            </div>
        </>
    )
}
