import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { TeamTable } from "./_components/table"
import { getTeamMembers } from "@/app/api/team/queries"
import { User } from "@prisma/client"

export default async function TeamPage() {
    const members: User[] = await getTeamMembers()
    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Nhóm của tôi
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <TeamTable members={members} />
            </div>
        </>
    )
}
