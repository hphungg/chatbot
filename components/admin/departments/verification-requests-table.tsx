"use client"

import { useState } from "react"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VerificationRequest {
    id: string
    fullName: string
    email: string
    department: string
    submittedAt: string
    status: "pending" | "approved" | "rejected"
}

const initialRequests: VerificationRequest[] = [
    {
        id: "VR-001",
        fullName: "Vũ Minh Quang",
        email: "quangvm@example.com",
        department: "Marketing",
        submittedAt: "10:24 03/10",
        status: "pending",
    },
    {
        id: "VR-002",
        fullName: "Đặng Thu Trang",
        email: "trangdt@example.com",
        department: "Tài chính",
        submittedAt: "18:55 02/10",
        status: "pending",
    },
    {
        id: "VR-003",
        fullName: "Nguyễn Gia Huy",
        email: "huynguyen@example.com",
        department: "Sản phẩm",
        submittedAt: "14:11 02/10",
        status: "approved",
    },
]

const statusLabel: Record<VerificationRequest["status"], string> = {
    pending: "Đang chờ",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
}

const statusVariant: Record<
    VerificationRequest["status"],
    "default" | "secondary" | "outline" | "destructive"
> = {
    pending: "outline",
    approved: "default",
    rejected: "destructive",
}

export function VerificationRequestsTable() {
    const [requests, setRequests] = useState(initialRequests)
    const [message, setMessage] = useState<string | null>(null)

    const updateRequest = (
        id: string,
        status: VerificationRequest["status"],
    ) => {
        setRequests((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          status,
                      }
                    : item,
            ),
        )
        setMessage(
            status === "approved"
                ? "Yêu cầu đã được phê duyệt"
                : "Yêu cầu đã bị từ chối",
        )
    }

    return (
        <Card>
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg">
                    Yêu cầu xác minh người dùng
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                    Kiểm tra và duyệt các yêu cầu tham gia phòng ban mới.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {message && (
                    <Alert>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phòng ban</TableHead>
                            <TableHead>Gửi lúc</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell>{request.fullName}</TableCell>
                                <TableCell>{request.email}</TableCell>
                                <TableCell>{request.department}</TableCell>
                                <TableCell>{request.submittedAt}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={statusVariant[request.status]}
                                    >
                                        {statusLabel[request.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            updateRequest(
                                                request.id,
                                                "rejected",
                                            )
                                        }
                                        disabled={request.status !== "pending"}
                                    >
                                        Từ chối
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            updateRequest(
                                                request.id,
                                                "approved",
                                            )
                                        }
                                        disabled={request.status !== "pending"}
                                    >
                                        Duyệt
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="text-muted-foreground text-sm">
                Hiện có{" "}
                {requests.filter((item) => item.status === "pending").length}{" "}
                yêu cầu đang chờ xử lý.
            </CardFooter>
        </Card>
    )
}
