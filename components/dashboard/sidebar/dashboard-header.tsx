"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useState } from "react"

type DashboardHeaderProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean
    ref?: React.Ref<HTMLElement>
}

export function DashboardHeader({
    className,
    fixed,
    children,
    ...props
}: DashboardHeaderProps) {
    const [offset, setOffset] = useState(0)
    return (
        <header
            className={cn(
                "z-50 h-16",
                fixed && "header-fixed peer/header sticky top-0 w-[inherit]",
                className,
            )}
            {...props}
        >
            <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
                <SidebarTrigger variant="outline" />
                {children}
            </div>
        </header>
    )
}
