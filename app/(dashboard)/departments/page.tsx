import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { Search } from "@/components/search"
import { DepartmentsTable } from "./_components/table"
import { Department } from "@prisma/client"
import { getAllDepartments } from "@/app/api/departments/queries"

export default async function Departments() {
    const departments: Department[] = await getAllDepartments()

    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">Phòng ban</h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <DepartmentsTable departments={departments} />
                </div>
            </div>
        </>
    )
}
