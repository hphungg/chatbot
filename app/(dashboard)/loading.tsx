import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div>
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-10 w-64 rounded-md" />
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-32" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2 rounded-lg border p-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                        <div className="space-y-2 rounded-lg border p-6">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                        <div className="space-y-2 rounded-lg border p-6">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-14" />
                        </div>
                        <div className="space-y-2 rounded-lg border p-6">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-18" />
                        </div>
                    </div>

                    <div className="rounded-lg border p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
