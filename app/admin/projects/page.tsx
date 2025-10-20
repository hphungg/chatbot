import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { getProjectsWithMembers } from "@/app/api/projects/queries"
import { AdminProjectsTable } from "@/components/admin/projects/admin-projects-table"
import { getAdminDepartments } from "@/app/api/admin/queries"

export default async function AdminProjectsPage() {
    const [projects, departments] = await Promise.all([
        getProjectsWithMembers(),
        getAdminDepartments(),
    ])

    return (
        <div>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Quản lý dự án
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <AdminProjectsTable
                    projects={projects}
                    departments={departments}
                />
            </div>
        </div>
    )
}
