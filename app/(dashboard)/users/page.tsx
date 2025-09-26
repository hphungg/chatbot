import { AppHeader } from "@/components/dashboard/app-header";
import { UsersProvider } from "./_components/user-provider";
import { Search } from "@/components/search";
import { Main } from "@/components/layout/main";
import { UsersTable } from "./_components/user-table";

export default function UsersPage() {
    return (
        <UsersProvider>
            <AppHeader fixed>
                <Search />
            </AppHeader>
            <Main>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                        <p className="text-muted-foreground">
                            Manage users and their permissions here.
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <UsersTable />
                </div>
            </Main>
        </UsersProvider>
    )
}