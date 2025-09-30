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
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <Skeleton className="h-10 w-36 rounded-md" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="space-y-4 rounded-lg border p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-4/5" />
                                    <Skeleton className="h-4 w-3/5" />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex space-x-2">
                                    <Skeleton className="h-8 w-16 rounded-md" />
                                    <Skeleton className="h-8 w-20 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2 rounded-lg border p-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                        <div className="space-y-2 rounded-lg border p-4">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                        <div className="space-y-2 rounded-lg border p-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-14" />
                        </div>
                        <div className="space-y-2 rounded-lg border p-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-18" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
