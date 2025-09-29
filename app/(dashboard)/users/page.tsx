import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header";
import { UsersProvider } from "./_components/user-provider";
import { Search } from "@/components/search";
import { UsersTable } from "./_components/user-table";

export default function UsersPage() {
    return (
        <UsersProvider>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Nhân viên</h2>
                        <p className="text-muted-foreground">
                            Quản lý nhân viên tại đây.
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <UsersTable />
                </div>
            </div>
        </UsersProvider>
    )
}