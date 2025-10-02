import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { AdminSearch } from "@/components/admin/search"
import { AdminDepartmentsSection } from "@/components/admin/departments/admin-departments-section"
import { getAllDepartments } from "@/app/api/departments/queries"

interface DepartmentWithStats {
    id: string
    name: string
    code: string
    employeeCount?: number | null
    projectCount?: number | null
}

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
        }),
    )

    return (
        <div>
            <DashboardHeader fixed>
                <AdminSearch placeholder="Tìm kiếm phòng ban" />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <AdminDepartmentsSection departments={editableDepartments} />
            </div>
        </div>
    )
}
