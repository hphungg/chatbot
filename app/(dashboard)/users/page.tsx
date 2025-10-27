import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { UsersTable } from "./_components/table"
import { getAllUsers } from "@/app/api/users/queries"
import { getAllDepartments } from "@/app/api/departments/queries"

export default async function UsersPage() {
    const [users, departments] = await Promise.all([
        getAllUsers(),
        getAllDepartments(),
    ])

    const departmentsForFilter = departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
    }))

    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Quản lý người dùng
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <UsersTable users={users} departments={departmentsForFilter} />
            </div>
        </>
    )
}
