"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useState } from "react"

type ChatHeaderProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean
    ref?: React.Ref<HTMLElement>
}

export function ChatHeader({
    className,
    fixed,
    children,
    ...props
}: ChatHeaderProps) {
    const [offset, setOffset] = useState(0)
    return (
        <header
            className={cn(
                "z-50 h-12",
                fixed && "header-fixed peer/header sticky top-0 w-[inherit]",
                className,
            )}
            {...props}
        >
            <div className="relative flex h-full items-center gap-3 border-b p-4 sm:gap-4">
                <SidebarTrigger variant="outline" />
            </div>
        </header>
    )
}
