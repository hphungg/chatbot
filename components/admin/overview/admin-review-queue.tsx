import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

const reviewRequests = [
    {
        id: "RQ-1001",
        email: "lethao@example.com",
        department: "Product",
        submittedAt: "10 phút trước",
    },
    {
        id: "RQ-1002",
        email: "duonglam@example.com",
        department: "Tài chính",
        submittedAt: "45 phút trước",
    },
    {
        id: "RQ-1003",
        email: "ngocyen@example.com",
        department: "Nhân sự",
        submittedAt: "1 giờ trước",
    },
]

export function AdminReviewQueue() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Hàng chờ phê duyệt</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã yêu cầu</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phòng ban</TableHead>
                            <TableHead>Gửi lúc</TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviewRequests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell>{request.email}</TableCell>
                                <TableCell>{request.department}</TableCell>
                                <TableCell>{request.submittedAt}</TableCell>
                                <TableCell className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm">
                                        Từ chối
                                    </Button>
                                    <Button size="sm">Duyệt</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
