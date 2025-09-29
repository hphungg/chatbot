import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header";
import { DepartmentsProvider } from "./_components/department-provider";
import { Search } from "@/components/search";
import { DepartmentsTable } from "./_components/department-table";
import { CreateDepartmentButton } from "./_components/create-department-button";
import { CreateDepartmentDialog } from "./_components/create-department-dialog";

export default function Departments() {
    return (
        <DepartmentsProvider>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
                        <p className="text-muted-foreground">
                            Manage departments and their information here.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CreateDepartmentButton />
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <DepartmentsTable />
                </div>
            </div>
            <CreateDepartmentDialog />
        </DepartmentsProvider>
    )
}
