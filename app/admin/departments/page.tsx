import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { getAllDepartments } from "@/app/api/departments/queries"
import { AdminDepartmentsTable } from "@/components/admin/departments/admin-departments-table"
import { DepartmentWithStats } from "@/lib/types"

export default async function AdminDepartmentsPage() {
    const departments = await getAllDepartments()
    const editableDepartments: DepartmentWithStats[] = departments.map(
        (department) => ({
            id: department.id,
            name: department.name,
            code: department.code,
            employeeCount:
                (department as unknown as { employeeCount?: number })
                    .employeeCount ?? 0,
            projectCount:
                (department as unknown as { projectCount?: number })
                    .projectCount ?? 0,
            manager:
                (
                    department as unknown as {
                        manager?: {
                            id: string
                            name: string
                            displayName?: string | null
                            email: string
                        } | null
                    }
                ).manager ?? null,
        }),
    )

    return (
        <div>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Quản lý phòng ban
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <AdminDepartmentsTable departments={editableDepartments} />
            </div>
        </div>
    )
}
