import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { AdminStatCards } from "@/components/admin/overview/admin-stat-cards"
import { AdminReviewQueue } from "@/components/admin/overview/admin-review-queue"
import { prisma } from "@/lib/db/prisma"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export default async function AdminPage() {
    const now = new Date()
    const [
        pendingVerificationCount,
        departmentCount,
        activeProjectCount,
        unverifiedUsers,
    ] = await Promise.all([
        prisma.user.count({ where: { userVerified: false } }),
        prisma.department.count(),
        prisma.project.count({
            where: {
                AND: [
                    {
                        OR: [{ startDate: null }, { startDate: { lte: now } }],
                    },
                    {
                        OR: [{ endDate: null }, { endDate: { gte: now } }],
                    },
                ],
            },
        }),
        prisma.user.findMany({
            where: { userVerified: false },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                department: {
                    select: { name: true },
                },
            },
        }),
    ])

    const stats = [
        {
            title: "Người dùng chưa xác minh",
            value: pendingVerificationCount.toString(),
            helperText: "Chờ phê duyệt tài khoản.",
            badge: pendingVerificationCount > 10 ? "Ưu tiên" : null,
        },
        {
            title: "Phòng ban đang hoạt động",
            value: departmentCount.toString(),
            helperText: "Tổng số phòng ban trong hệ thống.",
        },
        {
            title: "Dự án đang hoạt động",
            value: activeProjectCount.toString(),
            helperText: "Dự án còn trong thời gian triển khai.",
        },
    ]

    const reviewQueue = unverifiedUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department?.name ?? null,
        submittedAt: formatDistanceToNow(user.createdAt, {
            addSuffix: true,
            locale: vi,
        }),
    }))

    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
            </DashboardHeader>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <AdminStatCards stats={stats} />
                <AdminReviewQueue requests={reviewQueue} />
            </div>
        </>
    )
}
