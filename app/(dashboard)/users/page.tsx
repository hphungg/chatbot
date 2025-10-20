import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { Search } from "@/components/search"
import { UsersTable } from "./_components/table"
import { getAllUsers } from "@/app/api/users/queries"
import { User } from "@prisma/client"

export default async function UsersPage() {
    const users: User[] = await getAllUsers()
    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Quản lý người dùng
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <UsersTable users={users} />
            </div>
        </>
    )
}
