"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import AppLogo from "@/components/app-logo"
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
import { adminSidebarData } from "@/constant/admin-sidebar-data"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo className="ml-1" />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-2">
                    <SidebarMenu>
                        {adminSidebarData.map((item) => {
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
                                            <item.icon className="size-4" />
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
                    href="/"
                    className={buttonVariants({
                        variant: "outline",
                        className: "mb-3 w-full",
                    })}
                >
                    Quay lại Dashboard
                </Link>
                <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage
                            src="https://api.dicebear.com/7.x/shapes/svg?seed=admin"
                            alt="Admin"
                        />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm leading-tight font-semibold">
                            Quản trị viên
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                            admin@company.com
                        </p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
