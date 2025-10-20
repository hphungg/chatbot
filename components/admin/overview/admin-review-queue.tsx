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
import {
    verifyUserAction,
    deleteUserAction,
} from "@/app/api/admin/users/actions"

interface ReviewRequest {
    id: string
    email: string
    name: string
    department: string | null
    submittedAt: string
}

interface AdminReviewQueueProps {
    requests: ReviewRequest[]
}

export function AdminReviewQueue({ requests }: AdminReviewQueueProps) {
    return (
        <Card className="h-fit">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Hàng chờ phê duyệt</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Phòng ban</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead />
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
                                    <TableCell>{request.email}</TableCell>
                                    <TableCell>{request.name}</TableCell>
                                    <TableCell>
                                        {request.department ?? "Chưa phân bổ"}
                                    </TableCell>
                                    <TableCell>{request.submittedAt}</TableCell>
                                    <TableCell className="flex items-center justify-end gap-2">
                                        <form
                                            action={deleteUserAction}
                                            className="inline-flex"
                                        >
                                            <input
                                                type="hidden"
                                                name="userId"
                                                value={request.id}
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="submit"
                                            >
                                                Xóa
                                            </Button>
                                        </form>
                                        <form
                                            action={verifyUserAction}
                                            className="inline-flex"
                                        >
                                            <input
                                                type="hidden"
                                                name="userId"
                                                value={request.id}
                                            />
                                            <Button size="sm" type="submit">
                                                Duyệt
                                            </Button>
                                        </form>
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
