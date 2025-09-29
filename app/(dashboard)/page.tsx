import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header";
import { Search } from "@/components/search";

export default function Page() {

    return (
        <div>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Dashboard is temporarily empty.
                    </p>
                </div>
            </div>
        </div>
    )
}