import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div>
            <div className="border-b p-4">
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="flex h-[calc(100vh-5rem)] flex-col">
                <div className="flex-1 space-y-6 p-4">
                    <div className="flex h-full items-center justify-center">
                        <div className="space-y-4 text-center">
                            <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                            <Skeleton className="mx-auto h-6 w-48" />
                            <Skeleton className="mx-auto h-4 w-64" />
                        </div>
                    </div>
                </div>

                <div className="border-t p-4">
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 flex-1 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}
