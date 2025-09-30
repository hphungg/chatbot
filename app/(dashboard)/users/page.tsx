import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { UsersProvider } from "./_components/context"
import { Search } from "@/components/search"
import { UsersTable } from "./_components/table"
import { getAllUsers } from "@/app/api/users/queries"
import { User } from "@prisma/client"

export default async function UsersPage() {
    const users: User[] = await getAllUsers()
    return (
        <UsersProvider>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Nhân viên
                        </h2>
                        <p className="text-muted-foreground">
                            Xem danh sách nhân viên.
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <UsersTable users={users} />
                </div>
            </div>
        </UsersProvider>
    )
}
