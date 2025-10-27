"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Department } from "@prisma/client"
import { Spinner } from "@/components/ui/spinner"
import { updateProjectAction } from "@/app/api/admin/projects/actions"
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from "@/components/ui/multi-select"
import { ProjectWithStats } from "@/lib/types"
import { Pencil } from "lucide-react"

interface EditProjectDialogProps {
    project: ProjectWithStats
    departments: Department[]
}

const formSchema = z.object({
    projectName: z.string().min(1, "Tên dự án là bắt buộc"),
    departments: z
        .array(z.string())
        .min(1, "Vui lòng chọn ít nhất một phòng ban"),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
})

export function EditProjectDialog({
    project,
    departments,
}: EditProjectDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: project.name,
            departments: project.departmentIds || [],
            startDate: project.startDate ? new Date(project.startDate) : null,
            endDate: project.endDate ? new Date(project.endDate) : null,
        },
    })

    useEffect(() => {
        if (open && project) {
            form.reset({
                projectName: project.name,
                departments: project.departmentIds || [],
                startDate: project.startDate
                    ? new Date(project.startDate)
                    : null,
                endDate: project.endDate ? new Date(project.endDate) : null,
            })
        }
    }, [open, project, form])

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            await updateProjectAction({
                projectId: project.id,
                name: data.projectName,
                departmentId: data.departments,
                startDate: data.startDate ? data.startDate.toISOString() : null,
                endDate: data.endDate ? data.endDate.toISOString() : null,
            })
            toast.success("Cập nhật dự án thành công!")
            setOpen(false)
            router.refresh()
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật dự án. Vui lòng thử lại."
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>Cập nhật dự án</DialogTitle>
                            <DialogDescription>
                                Thay đổi thông tin dự án.
                            </DialogDescription>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên dự án</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nhập tên dự án"
                                            disabled={loading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="departments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phòng ban</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            values={field.value}
                                            onValuesChange={field.onChange}
                                        >
                                            <MultiSelectTrigger>
                                                <MultiSelectValue placeholder="Chọn phòng ban" />
                                            </MultiSelectTrigger>
                                            <MultiSelectContent>
                                                {departments.map(
                                                    (department) => (
                                                        <MultiSelectItem
                                                            value={
                                                                department.id
                                                            }
                                                            key={department.id}
                                                        >
                                                            {department.name}
                                                        </MultiSelectItem>
                                                    ),
                                                )}
                                            </MultiSelectContent>
                                        </MultiSelect>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ngày bắt đầu</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nhập ngày bắt đầu"
                                            type="date"
                                            disabled={loading}
                                            value={
                                                field.value instanceof Date
                                                    ? field.value
                                                          .toISOString()
                                                          .split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value
                                                        ? new Date(
                                                              e.target.value,
                                                          )
                                                        : null,
                                                )
                                            }
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ngày kết thúc</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nhập ngày kết thúc"
                                            type="date"
                                            disabled={loading}
                                            value={
                                                field.value instanceof Date
                                                    ? field.value
                                                          .toISOString()
                                                          .split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value
                                                        ? new Date(
                                                              e.target.value,
                                                          )
                                                        : null,
                                                )
                                            }
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner /> : "Lưu thay đổi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
