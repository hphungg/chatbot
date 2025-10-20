"use client"

import { useState } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { createProjectForManager } from "@/app/api/projects/actions"

const formSchema = z.object({
    projectName: z.string().min(1, "Tên dự án là bắt buộc"),
    startDate: z.date(),
    endDate: z.date(),
})

export function CreateProjectDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: "",
            startDate: new Date(),
            endDate: new Date(),
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            await createProjectForManager({
                name: data.projectName,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
            })
            toast.success("Tạo dự án thành công!")
            form.reset()
            setOpen(false)
            router.refresh()
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể tạo dự án. Vui lòng thử lại."
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Tạo dự án mới</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>Tạo dự án mới</DialogTitle>
                            <DialogDescription>
                                Tạo dự án cho phòng ban của bạn.
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
                                                    new Date(e.target.value),
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
                                                    new Date(e.target.value),
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
                                {loading ? <Spinner /> : "Tạo dự án"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
