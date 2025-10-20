import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { getCalendarEvents } from "../api/calendar/queries"
import { ScheduleClient } from "@/components/dashboard/schedule/schedule-client"

export default async function Page() {
    const events = await getCalendarEvents()
    return (
        <div>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Lịch làm việc
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <ScheduleClient events={events} />
            </div>
        </div>
    )
}
