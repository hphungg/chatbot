import { AppHeader } from "@/components/dashboard/app-header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";

export default function Departments() {
    return (
        <div>
            <AppHeader fixed>
                <Search />
            </AppHeader>
            <Main>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
                        <p className="text-muted-foreground">
                            Manage departments here.
                        </p>
                    </div>
                </div>
            </Main>
        </div>
    );
}
