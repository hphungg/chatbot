import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const activities = [
    {
        id: "activity-1",
        title: "Mời người dùng mới",
        description: "Trần Nguyễn (trannguyen@example.com)",
        time: "5 phút trước",
        status: "Đang chờ",
    },
    {
        id: "activity-2",
        title: "Xác minh người dùng",
        description: "Phạm Anh (phamanh@example.com)",
        time: "30 phút trước",
        status: "Đã duyệt",
    },
    {
        id: "activity-3",
        title: "Cập nhật phòng ban",
        description: "Thêm 3 người dùng vào phòng ban Marketing",
        time: "1 giờ trước",
        status: "Hoàn tất",
    },
    {
        id: "activity-4",
        title: "Khóa tài khoản",
        description: "Nguyễn Mai (nguyenmai@example.com)",
        time: "Hôm qua",
        status: "Tạm khóa",
    },
]

const statusVariant: Record<string, string> = {
    "Đang chờ": "outline",
    "Đã duyệt": "default",
    "Hoàn tất": "secondary",
    "Tạm khóa": "destructive",
}

export function AdminActivityList() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <ScrollArea className="h-64 pe-2">
                    <div className="space-y-4">
                        {activities.map((activity) => (
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
                                            (statusVariant[activity.status] as
                                                | "default"
                                                | "secondary"
                                                | "outline"
                                                | "destructive") ?? "outline"
                                        }
                                    >
                                        {activity.status}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-2 text-xs">
                                    {activity.time}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
