import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"

export default function Loading() {
    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Nhóm của tôi
                </h1>
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 w-full max-w-sm rounded-md bg-gray-200"></div>
                    <div className="h-96 w-full rounded-md border bg-gray-100"></div>
                </div>
            </div>
        </>
    )
}
