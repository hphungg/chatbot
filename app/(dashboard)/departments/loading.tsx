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
                    <div className="flex flex-wrap items-center justify-between space-y-2">
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-40 rounded-md" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="space-y-3 rounded-lg border p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex items-center space-x-2 pt-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-6 w-8 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 rounded-lg border p-6">
                        <Skeleton className="h-6 w-40" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
