import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div>
            <div className="border-b p-4">
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="flex h-[calc(100vh-5rem)] flex-col">
                <div className="flex-1 p-4 space-y-4">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <div className="max-w-xs space-y-2">
                                <Skeleton className="h-4 w-16 ml-auto" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <div className="max-w-md space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <div className="max-w-xs space-y-2">
                                <Skeleton className="h-4 w-16 ml-auto" />
                                <Skeleton className="h-8 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t p-4">
                    <div className="flex space-x-2">
                        <Skeleton className="flex-1 h-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}
