"use client"

import { FormEvent, useMemo, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateCurrentUserDisplayName } from "@/app/api/users/queries"
import { useRouter } from "next/navigation"

interface DisplayNameFormProps {
    initialDisplayName: string | null
    fallbackName: string
}

export function DisplayNameForm({
    initialDisplayName,
    fallbackName,
}: DisplayNameFormProps) {
    const router = useRouter()
    const [displayName, setDisplayName] = useState(
        initialDisplayName ?? fallbackName,
    )
    const [isPending, startTransition] = useTransition()

    const baseline = useMemo(
        () => initialDisplayName ?? fallbackName,
        [fallbackName, initialDisplayName],
    )
    const isDirty = useMemo(
        () => displayName.trim() !== baseline.trim(),
        [baseline, displayName],
    )

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const value = displayName.trim()

        if (!value) {
            toast.error("Tên hiển thị không được để trống")
            return
        }

        startTransition(() => {
            updateCurrentUserDisplayName(value)
                .then(() => {
                    toast.success("Cập nhật tên hiển thị thành công")
                    router.refresh()
                })
                .catch((error) => {
                    console.error(error)
                    toast.error("Cập nhật tên hiển thị thất bại")
                })
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="display-name">Tên hiển thị</Label>
                <Input
                    id="display-name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Nhập tên hiển thị"
                    maxLength={120}
                />
                <p className="text-muted-foreground text-sm">
                    Tên hiển thị sẽ hiển thị với các người dùng khác.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={isPending || !isDirty}>
                    {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isPending || !isDirty}
                    onClick={() => setDisplayName(baseline)}
                >
                    Đặt lại
                </Button>
            </div>
        </form>
    )
}
