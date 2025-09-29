import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { Search } from "@/components/search"

export default function ProjectsPage() {
    return (
        <div>
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
                            Quản lý dự án tại đây.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
