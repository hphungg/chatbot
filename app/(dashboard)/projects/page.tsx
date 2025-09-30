import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { ProjectsProvider } from "./_components/context"
import { Search } from "@/components/search"
import { ProjectsTable } from "./_components/table"

export default function ProjectsPage() {
    return (
        <ProjectsProvider>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Dự án
                        </h2>
                        <p className="text-muted-foreground">
                            Quản lý các dự án của bạn.
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <ProjectsTable />
                </div>
            </div>
        </ProjectsProvider>
    )
}
