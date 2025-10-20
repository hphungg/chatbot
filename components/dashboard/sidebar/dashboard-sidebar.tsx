"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import AppLogo from "@/components/app-logo"
import { sidebarData } from "@/constant/sidebar-data"
import { buttonVariants } from "@/components/ui/button"
import { BotIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const DashboardUser = dynamic(
    () =>
        import("./dashboard-user").then((mod) => ({
            default: mod.DashboardUser,
        })),
    { ssr: false },
)

export function DashboardSidebar({ user }: { user: any }) {
    const pathname = usePathname()

    const filteredSidebarData = sidebarData.filter((item) => {
        if (item.roles && item.roles.length > 0) {
            return item.roles.includes(user.role)
        }
        return true
    })

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo className="ml-1" />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-2">
                    <SidebarMenu className="p-2">
                        {filteredSidebarData.map((item) => {
                            const isActive = pathname === item.url
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <Link
                                        href={item.url}
                                        className={cn(
                                            "hover:bg-accent text-muted-foreground flex flex-row items-center rounded-lg py-2 text-base hover:text-black",
                                            {
                                                "bg-sidebar-primary hover:bg-sidebar-primary text-white hover:text-white":
                                                    isActive,
                                            },
                                        )}
                                    >
                                        <item.icon className="mx-3" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Link
                    className={buttonVariants({
                        variant: "outline",
                        className: "mb-2 w-full",
                    })}
                    href="/chat"
                >
                    <BotIcon className="size-4" /> Tới trang Chat
                </Link>
                <DashboardUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}
