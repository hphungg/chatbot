import { Schedule } from "@/components/dashboard/schedule/schedule"
import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { Search } from "@/components/search"
import { getCalendarEvents } from "../api/calendar/queries"

export default async function Page() {
    const events = await getCalendarEvents()
    return (
        <div suppressHydrationWarning>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Lịch làm việc
                        </h2>
                        <p className="text-muted-foreground">
                            Dữ liệu được đồng bộ từ Google Calendar.
                        </p>
                    </div>
                </div>
                <Schedule events={events} />
            </div>
        </div>
    )
}
