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

interface ReviewRequest {
    id: string
    email: string
    department: string | null
    submittedAt: string
}

interface AdminReviewQueueProps {
    requests: ReviewRequest[]
}

export function AdminReviewQueue({ requests }: AdminReviewQueueProps) {
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
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-muted-foreground text-center text-sm"
                                >
                                    Không có yêu cầu chờ xử lý.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.id}</TableCell>
                                    <TableCell>{request.email}</TableCell>
                                    <TableCell>
                                        {request.department ?? "Chưa phân bổ"}
                                    </TableCell>
                                    <TableCell>{request.submittedAt}</TableCell>
                                    <TableCell className="flex items-center justify-end gap-2">
                                        <Button variant="outline" size="sm">
                                            Từ chối
                                        </Button>
                                        <Button size="sm">Duyệt</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
