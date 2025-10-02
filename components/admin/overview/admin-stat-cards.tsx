import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatCard {
    title: string
    value: string
    trend: string
    trendLabel: string
    badge?: string
}

const stats: StatCard[] = [
    {
        title: "Lời mời đang xử lý",
        value: "12",
        trend: "+3",
        trendLabel: "so với tuần trước",
    },
    {
        title: "Yêu cầu xác minh",
        value: "5",
        trend: "-2",
        trendLabel: "so với tuần trước",
        badge: "Ưu tiên",
    },
    {
        title: "Tài khoản bị khóa",
        value: "2",
        trend: "0",
        trendLabel: "7 ngày qua",
    },
]

export function AdminStatCards() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="text-muted-foreground text-base font-medium">
                                {item.title}
                            </CardTitle>
                            <span className="mt-2 block text-3xl font-semibold">
                                {item.value}
                            </span>
                        </div>
                        {item.badge && (
                            <Badge variant="outline">{item.badge}</Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            <span className="font-medium text-green-600 dark:text-green-400">
                                {item.trend}
                            </span>{" "}
                            {item.trendLabel}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
