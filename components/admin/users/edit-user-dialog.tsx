"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { updateUserAction } from "@/app/api/admin/users/actions"
import { Department, User } from "@prisma/client"
import { Pencil } from "lucide-react"

interface EditUserDialogProps {
    user: User & {
        department?: {
            id: string
            name: string
            code: string
        } | null
    }
    departments: Department[]
}

const roles = [
    { value: "employee", label: "Nhân viên" },
    { value: "manager", label: "Quản lý" },
    { value: "director", label: "Giám đốc" },
    { value: "admin", label: "Quản trị viên" },
]

export function EditUserDialog({ user, departments }: EditUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(user.name)
    const [displayName, setDisplayName] = useState(user.displayName || "")
    const [email, setEmail] = useState(user.email)
    const [role, setRole] = useState(user.role)
    const [departmentId, setDepartmentId] = useState(
        user.departmentId || "none",
    )
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedName = name.trim()
        const trimmedEmail = email.trim().toLowerCase()

        if (!trimmedName || !trimmedEmail) {
            toast.error("Vui lòng điền đầy đủ thông tin")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("userId", user.id)
            formData.append("name", trimmedName)
            formData.append("displayName", displayName.trim())
            formData.append("email", trimmedEmail)
            formData.append("role", role)
            formData.append(
                "departmentId",
                departmentId === "none" ? "" : departmentId,
            )

            await updateUserAction(formData)
            toast.success("Cập nhật thông tin người dùng thành công")
            setOpen(false)
        } catch (error) {
            console.error("Error updating user:", error)
            toast.error("Đã xảy ra lỗi khi cập nhật thông tin người dùng")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin người dùng trong hệ thống.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-user-name">
                                Tên người dùng
                            </Label>
                            <Input
                                id="edit-user-name"
                                type="text"
                                placeholder="Nguyễn Văn A"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-user-display-name">
                                Tên hiển thị
                            </Label>
                            <Input
                                id="edit-user-display-name"
                                type="text"
                                placeholder="Tên hiển thị (tùy chọn)"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-user-email">Email</Label>
                            <Input
                                id="edit-user-email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-user-role">Vai trò</Label>
                            <Select
                                value={role}
                                onValueChange={setRole}
                                disabled={loading}
                            >
                                <SelectTrigger id="edit-user-role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem
                                            key={r.value}
                                            value={r.value}
                                        >
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-user-department">
                                Phòng ban
                            </Label>
                            <Select
                                value={departmentId}
                                onValueChange={setDepartmentId}
                                disabled={loading}
                            >
                                <SelectTrigger id="edit-user-department">
                                    <SelectValue placeholder="Chọn phòng ban" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Không có phòng ban
                                    </SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem
                                            key={dept.id}
                                            value={dept.id}
                                        >
                                            {dept.name}
                                            {dept.code ? ` (${dept.code})` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
