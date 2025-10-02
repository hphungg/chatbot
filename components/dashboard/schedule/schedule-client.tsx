"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Events } from "@/lib/types"

const ScheduleLazy = dynamic(
    () =>
        import("@/components/dashboard/schedule/schedule").then(
            (module) => module.Schedule,
        ),
    {
        ssr: false,
        loading: () => (
            <Skeleton className="h-[520px] w-full rounded-xl border" />
        ),
    },
)

interface ScheduleClientProps {
    events: Events[]
}

export function ScheduleClient({ events }: ScheduleClientProps) {
    return <ScheduleLazy events={events} />
}
