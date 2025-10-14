import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { AdminSearch } from "@/components/admin/search"
import { AdminProjectsSection } from "@/components/admin/projects/admin-projects-section"
import { getProjectsWithMembers } from "@/app/api/projects/queries"
import { prisma } from "@/lib/db/prisma"

export default async function AdminProjectsPage() {
    const [projects, departments] = await Promise.all([
        getProjectsWithMembers(),
        prisma.department.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: "asc" },
        }),
    ])

    const adminProjects = projects.map((project) => ({
        id: project.id,
        name: project.name,
        departmentId: project.departmentId,
        departmentName: project.departmentName,
        memberCount: project.members.length,
        startDate: project.startDate,
        endDate: project.endDate,
    }))

    return (
        <div>
            <DashboardHeader fixed>
                <AdminSearch placeholder="Tìm kiếm dự án" />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <AdminProjectsSection
                    projects={adminProjects}
                    departments={departments}
                />
            </div>
        </div>
    )
}
