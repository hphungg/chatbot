"use client"

import { useState } from "react"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export function InviteUserForm() {
    const [role, setRole] = useState("member")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitted(true)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Mời người dùng mới</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-4">
                    {submitted && (
                        <Alert className="border-green-500/60 bg-green-50 dark:bg-green-500/10">
                            <CheckCircle2 className="text-green-600 dark:text-green-400" />
                            <AlertTitle>Mời thành công</AlertTitle>
                            <AlertDescription>
                                Email mời đã được tạo. Bạn có thể theo dõi trạng
                                thái ở danh sách bên cạnh.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="admin-invite-name">Họ và tên</Label>
                            <Input
                                id="admin-invite-name"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-invite-email">Email</Label>
                            <Input
                                id="admin-invite-email"
                                type="email"
                                placeholder="example@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger id="admin-invite-role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">
                                        Nhân viên
                                    </SelectItem>
                                    <SelectItem value="manager">
                                        Quản lý
                                    </SelectItem>
                                    <SelectItem value="viewer">
                                        Quan sát
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-invite-expire">
                                Thời hạn mời
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="admin-invite-expire"
                                    type="number"
                                    min={1}
                                    defaultValue={7}
                                    className="flex-1"
                                />
                                <span className="text-muted-foreground text-sm">
                                    ngày
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-invite-message">
                            Lời nhắn (tùy chọn)
                        </Label>
                        <Textarea
                            id="admin-invite-message"
                            placeholder="Thêm hướng dẫn hoặc ghi chú cho người được mời."
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                    >
                        Làm mới
                    </Button>
                    <Button type="submit">Gửi lời mời</Button>
                </CardFooter>
            </form>
        </Card>
    )
}
