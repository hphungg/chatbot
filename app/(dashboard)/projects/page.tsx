import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { ProjectsProvider } from "./_components/context"
import { ProjectsTable } from "./_components/table"
import { ProjectMembersDialog } from "./_components/members-dialog"
import { getProjectsWithMembers } from "@/app/api/projects/queries"
import { CreateProjectDialog } from "./_components/create-project-dialog"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function ProjectsPage() {
    const projects = await getProjectsWithMembers()

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const isManager = session?.user?.role === "manager"

    return (
        <ProjectsProvider projects={projects}>
            <DashboardHeader fixed>
                <div className="flex w-full items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Dự án</h1>
                    {isManager && <CreateProjectDialog />}
                </div>
            </DashboardHeader>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="-mx-4 flex-1 space-y-8 overflow-auto px-4 py-1">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">
                            Dự án đang hoạt động
                        </h3>
                        <ProjectsTable
                            type="active"
                            emptyMessage="Không có dự án đang hoạt động."
                        />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">
                            Dự án đã kết thúc hoặc hết hạn
                        </h3>
                        <ProjectsTable
                            type="ended"
                            emptyMessage="Không có dự án đã kết thúc hoặc hết hạn."
                        />
                    </div>
                </div>
            </div>
            <ProjectMembersDialog />
        </ProjectsProvider>
    )
}
