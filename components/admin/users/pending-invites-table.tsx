import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const invites = [
    {
        email: "phamvan@example.com",
        role: "Quản lý",
        invitedBy: "Nguyễn Thảo",
        status: "Đã gửi",
        sentAt: "Hôm nay, 09:15",
    },
    {
        email: "lechi@example.com",
        role: "Nhân viên",
        invitedBy: "Phạm Thanh",
        status: "Đang chờ",
        sentAt: "Hôm qua, 16:40",
    },
    {
        email: "ngocthanh@example.com",
        role: "Quan sát",
        invitedBy: "Trần Dũng",
        status: "Đã chấp nhận",
        sentAt: "02/10, 10:05",
    },
]

const statusColor: Record<string, string> = {
    "Đã gửi": "secondary",
    "Đang chờ": "outline",
    "Đã chấp nhận": "default",
}

export function PendingInvitesTable() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Lời mời gần đây</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Người mời</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invites.map((invite) => (
                            <TableRow key={invite.email}>
                                <TableCell>{invite.email}</TableCell>
                                <TableCell>{invite.role}</TableCell>
                                <TableCell>{invite.invitedBy}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            (statusColor[invite.status] as
                                                | "default"
                                                | "secondary"
                                                | "outline") ?? "outline"
                                        }
                                    >
                                        {invite.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{invite.sentAt}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        Gửi lại
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
