"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type ChatHeaderProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean
    title?: string
}

export function ChatHeader({
    className,
    fixed,
    children,
    title,
    ...props
}: ChatHeaderProps) {
    const heading =
        title && title.trim().length > 0 ? title : "Cuộc trò chuyện mới"
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
                <span className="text-lg leading-none font-bold">
                    {heading}
                </span>
                {children}
            </div>
        </header>
    )
}
