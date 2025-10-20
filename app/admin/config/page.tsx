import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { ConfigForm } from "@/components/admin/config/config-form"
import { getAIConfig } from "@/app/api/admin/config/actions"

export default async function AdminConfigPage() {
    const config = await getAIConfig()

    return (
        <div>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Cấu hình hệ thống
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl">
                    <ConfigForm initialConfig={config} />
                </div>
            </div>
        </div>
    )
}
