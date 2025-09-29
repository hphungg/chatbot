import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div>
            <div className="border-b p-4">
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="flex h-[calc(100vh-5rem)] flex-col">
                <div className="flex-1 p-4 space-y-6">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                            <Skeleton className="h-6 w-48 mx-auto" />
                            <Skeleton className="h-4 w-64 mx-auto" />
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
    );
}