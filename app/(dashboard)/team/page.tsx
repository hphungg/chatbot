import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { TeamTable } from "./_components/table"
import { getTeamMembers } from "@/app/api/team/queries"
import { User } from "@prisma/client"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function TeamPage() {
    const members: User[] = await getTeamMembers()
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    const isManager = session?.user?.role === "manager"

    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Nhóm của tôi
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <TeamTable members={members} isManager={isManager} />
            </div>
        </>
    )
}
