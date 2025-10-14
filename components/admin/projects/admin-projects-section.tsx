"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    createProjectAction,
    updateProjectAction,
    deleteProjectAction,
} from "@/app/api/admin/projects/actions"
import { AdminProjectsTable } from "./admin-projects-table"
import { ProjectDialog } from "./project-dialog"
import type {
    AdminProjectItem,
    DepartmentOption,
    ProjectFormValues,
} from "./types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AdminProjectsSectionProps {
    projects: AdminProjectItem[]
    departments: DepartmentOption[]
}

type DialogMode = "create" | "edit"

export function AdminProjectsSection({
    projects,
    departments,
}: AdminProjectsSectionProps) {
    const router = useRouter()
    const [items, setItems] = useState<AdminProjectItem[]>(() => [...projects])
    const [mode, setMode] = useState<DialogMode>("create")
    const [open, setOpen] = useState(false)
    const [selection, setSelection] = useState<AdminProjectItem | null>(null)
    const [pendingDelete, setPendingDelete] = useState<AdminProjectItem | null>(
        null,
    )
    const [isPending, startTransition] = useTransition()

    const sortedItems = useMemo(
        () =>
            [...items].sort((a, b) =>
                a.name.localeCompare(b.name, "vi", { sensitivity: "base" }),
            ),
        [items],
    )

    const handleCreateClick = () => {
        setMode("create")
        setSelection(null)
        setOpen(true)
    }

    const handleEditClick = (project: AdminProjectItem) => {
        setMode("edit")
        setSelection(project)
        setOpen(true)
    }

    const handleDeleteClick = (project: AdminProjectItem) => {
        setPendingDelete(project)
    }

    const closeDialog = () => {
        setOpen(false)
    }

    const refreshRouter = () => {
        router.refresh()
    }

    const handleSubmit = (values: ProjectFormValues) => {
        startTransition(async () => {
            try {
                if (mode === "create") {
                    const result = await createProjectAction(values)
                    if (result?.project) {
                        setItems((prev) => [result.project, ...prev])
                        toast.success("Đã tạo dự án mới")
                    }
                } else if (selection) {
                    const result = await updateProjectAction({
                        projectId: selection.id,
                        ...values,
                    })
                    if (result?.project) {
                        setItems((prev) =>
                            prev.map((project) =>
                                project.id === result.project.id
                                    ? result.project
                                    : project,
                            ),
                        )
                        toast.success("Đã cập nhật dự án")
                    }
                }
                closeDialog()
                refreshRouter()
            } catch (error) {
                console.error(error)
                toast.error("Không thể lưu dự án. Vui lòng thử lại.")
            }
        })
    }

    const confirmDelete = () => {
        if (!pendingDelete) return
        startTransition(async () => {
            try {
                await deleteProjectAction(pendingDelete.id)
                setItems((prev) =>
                    prev.filter((project) => project.id !== pendingDelete.id),
                )
                toast.success("Đã xóa dự án")
                setPendingDelete(null)
                refreshRouter()
            } catch (error) {
                console.error(error)
                toast.error("Không thể xóa dự án. Vui lòng thử lại.")
            }
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">
                            Quản lý dự án doanh nghiệp
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Tạo mới, chỉnh sửa hoặc xóa dự án. Các thay đổi sẽ
                            hiển thị cho toàn bộ tổ chức sau khi lưu.
                        </p>
                    </div>
                    <Button onClick={handleCreateClick}>Thêm dự án</Button>
                </CardHeader>
                <CardContent>
                    <AdminProjectsTable
                        projects={sortedItems}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        disableActions={isPending}
                    />
                </CardContent>
            </Card>

            <ProjectDialog
                mode={mode}
                open={open}
                onOpenChange={setOpen}
                loading={isPending}
                project={selection ?? null}
                departments={departments}
                onSubmit={handleSubmit}
            />

            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(value) => {
                    if (!value) setPendingDelete(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa dự án</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ xóa dự án "{pendingDelete?.name}".
                            Các quyền truy cập liên quan cũng bị thu hồi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isPending}
                        >
                            Xóa dự án
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
