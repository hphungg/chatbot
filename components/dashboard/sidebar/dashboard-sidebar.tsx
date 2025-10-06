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
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import AppLogo from "@/components/app-logo"
import { sidebarData } from "@/constant/sidebar-data"
import { buttonVariants } from "@/components/ui/button"
import { BotIcon } from "lucide-react"

const DashboardUser = dynamic(
    () =>
        import("./dashboard-user").then((mod) => ({
            default: mod.DashboardUser,
        })),
    { ssr: false },
)

export function DashboardSidebar({ user }: { user: any }) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo className="ml-1" />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-2">
                    <SidebarMenu>
                        {sidebarData.map((item) => {
                            const isActive = pathname === item.url
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className={
                                            isActive
                                                ? "bg-black text-white hover:bg-gray-800 hover:text-white"
                                                : ""
                                        }
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
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
