import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { Search } from "@/components/search"
import { ProjectsProvider } from "./_components/context"
import { ProjectsTable } from "./_components/table"
import { ProjectMembersDialog } from "./_components/members-dialog"
import { getProjectsWithMembers } from "@/app/api/projects/queries"

export default async function ProjectsPage() {
    const projects = await getProjectsWithMembers()

    return (
        <ProjectsProvider projects={projects}>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Dự án
                        </h2>
                        <p className="text-muted-foreground">
                            Quản lý các dự án của bạn.
                        </p>
                    </div>
                </div>
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
