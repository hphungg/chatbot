import { Schedule } from "@/components/dashboard/schedule/schedule"
import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { Search } from "@/components/search"
import { Calendar } from "@/components/ui/calendar"

export default function Page() {
    return (
        <div>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <Schedule />
            </div>
        </div>
    )
}
