import { Skeleton } from "@/components/ui/skeleton";

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
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32 rounded-md" />
                    </div>

                    <div className="rounded-md border">
                        <div className="border-b p-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>

                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="border-b p-4 last:border-b-0">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-4" />
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex space-x-2">
                            <Skeleton className="h-8 w-20 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}