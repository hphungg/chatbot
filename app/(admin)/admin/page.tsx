import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { AdminSearch } from "@/components/admin/search"
import { AdminStatCards } from "@/components/admin/overview/admin-stat-cards"
import { AdminActivityList } from "@/components/admin/overview/admin-activity-list"
import { AdminReviewQueue } from "@/components/admin/overview/admin-review-queue"

export default function AdminPage() {
    return (
        <div>
            <DashboardHeader fixed>
                <AdminSearch placeholder="Tìm kiếm trong quản trị" />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Trung tâm quản trị
                        </h1>
                        <p className="text-muted-foreground">
                            Theo dõi hoạt động và xử lý yêu cầu của hệ thống.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <AdminStatCards />
                    <div className="grid gap-6 lg:grid-cols-2">
                        <AdminReviewQueue />
                        <AdminActivityList />
                    </div>
                </div>
            </div>
        </div>
    )
}
