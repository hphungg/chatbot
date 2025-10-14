import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { AdminSearch } from "@/components/admin/search"
import { AdminUsersSection } from "@/components/admin/users/admin-users-section"
import { getAdminUsers, getAdminDepartments } from "@/app/api/admin/queries"

export default async function AdminUsersPage() {
    const [users, departments] = await Promise.all([
        getAdminUsers(),
        getAdminDepartments(),
    ])

    return (
        <div>
            <DashboardHeader fixed>
                <AdminSearch placeholder="Tìm kiếm người dùng" />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <AdminUsersSection users={users} departments={departments} />
            </div>
        </div>
    )
}
