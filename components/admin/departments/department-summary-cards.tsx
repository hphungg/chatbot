import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const departmentStats = [
    {
        name: "Kinh doanh",
        members: 28,
        pending: 3,
        progress: 82,
    },
    {
        name: "Sản phẩm",
        members: 34,
        pending: 1,
        progress: 64,
    },
    {
        name: "Nhân sự",
        members: 19,
        pending: 2,
        progress: 47,
    },
]

export function DepartmentSummaryCards() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {departmentStats.map((item) => (
                <Card key={item.name}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">
                            {item.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Thành viên
                            </span>
                            <span className="font-medium">{item.members}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Đang chờ duyệt
                            </span>
                            <span className="font-medium">{item.pending}</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
