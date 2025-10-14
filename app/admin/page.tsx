import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { AdminSearch } from "@/components/admin/search"
import { AdminStatCards } from "@/components/admin/overview/admin-stat-cards"
import { AdminActivityList } from "@/components/admin/overview/admin-activity-list"
import { AdminReviewQueue } from "@/components/admin/overview/admin-review-queue"
import { prisma } from "@/lib/db/prisma"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export default async function AdminPage() {
    const [
        pendingVerificationCount,
        departmentCount,
        lockedAccountsCount,
        recentUsers,
        unverifiedUsers,
    ] = await Promise.all([
        prisma.user.count({ where: { userVerified: false } }),
        prisma.department.count(),
        prisma.user.count({ where: { banned: true } }),
        prisma.user.findMany({
            orderBy: { updatedAt: "desc" },
            take: 6,
            select: {
                id: true,
                name: true,
                displayName: true,
                email: true,
                updatedAt: true,
                userVerified: true,
                banned: true,
            },
        }),
        prisma.user.findMany({
            where: { userVerified: false },
            orderBy: { createdAt: "asc" },
            take: 5,
            select: {
                id: true,
                email: true,
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
            title: "Tài khoản bị khóa",
            value: lockedAccountsCount.toString(),
            helperText: "Cần xem xét kích hoạt lại.",
            badge: lockedAccountsCount > 0 ? "Cảnh báo" : null,
        },
    ]

    const reviewQueue = unverifiedUsers.map((user) => ({
        id: user.id,
        email: user.email,
        department: user.department?.name ?? null,
        submittedAt: formatDistanceToNow(user.createdAt, {
            addSuffix: true,
            locale: vi,
        }),
    }))

    const activities = recentUsers.map((user) => {
        const status = user.banned
            ? "Tạm khóa"
            : user.userVerified
              ? "Đã duyệt"
              : "Đang chờ"
        const title = user.displayName ?? user.name ?? user.email
        return {
            id: user.id,
            title,
            description: user.email,
            time: formatDistanceToNow(user.updatedAt, {
                addSuffix: true,
                locale: vi,
            }),
            status,
        }
    })

    return (
        <div>
            <DashboardHeader fixed>
                <AdminSearch placeholder="Tìm kiếm trong quản trị" />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Trung tâm quản trị
                        </h1>
                        <p className="text-muted-foreground">
                            Theo dõi hoạt động và xử lý yêu cầu của hệ thống.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <AdminStatCards stats={stats} />
                    <div className="grid gap-6 lg:grid-cols-2">
                        <AdminReviewQueue requests={reviewQueue} />
                        <AdminActivityList activities={activities} />
                    </div>
                </div>
            </div>
        </div>
    )
}
