import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ActivityItem {
    id: string
    title: string
    description: string
    time: string
    status: string
}

interface AdminActivityListProps {
    activities: ActivityItem[]
}

const statusVariant: Record<string, string> = {
    "Đang chờ": "outline",
    "Đã duyệt": "default",
    "Hoàn tất": "secondary",
    "Tạm khóa": "destructive",
    "Hoạt động": "secondary",
}

export function AdminActivityList({ activities }: AdminActivityListProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <ScrollArea className="h-64 pe-2">
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                Chưa có hoạt động nào gần đây.
                            </div>
                        ) : (
                            activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="hover:bg-muted/50 rounded-lg border p-3 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {activity.title}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                (statusVariant[
                                                    activity.status
                                                ] as
                                                    | "default"
                                                    | "secondary"
                                                    | "outline"
                                                    | "destructive") ??
                                                "outline"
                                            }
                                        >
                                            {activity.status}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground mt-2 text-xs">
                                        {activity.time}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
