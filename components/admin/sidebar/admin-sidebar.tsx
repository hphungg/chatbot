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
    useSidebar,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { adminSidebarData } from "@/constant/admin-sidebar-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, ChevronDown, LogOut } from "lucide-react"
import { SignOutDialog } from "@/components/auth/sign-out-dialog"
import useDialogState from "@/hooks/use-dialog-state"

interface AdminSidebarProps {
    user: {
        name: string | null
        displayName: string | null
        email: string
        image: string | null
    }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname()
    const { isMobile } = useSidebar()
    const [signOutOpen, setSignOutOpen] = useDialogState<boolean>(false)
    const displayName = user.displayName ?? user.name ?? user.email

    return (
        <>
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
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton size="lg">
                                        <Avatar className="h-8 w-8 rounded-full">
                                            <AvatarFallback className="rounded-lg bg-transparent">
                                                <Bot className="size-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="ml-1 grid flex-1 text-start text-base">
                                            <span className="truncate font-semibold">
                                                {displayName}
                                            </span>
                                            <span className="truncate text-xs">
                                                {user.email}
                                            </span>
                                        </div>
                                        <ChevronDown className="ms-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-base">
                                            <Avatar className="h-9 w-9 rounded-full">
                                                <AvatarFallback className="rounded-lg bg-transparent">
                                                    <Bot className="size-6" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-1 grid flex-1">
                                                <span className="truncate font-semibold">
                                                    {displayName}
                                                </span>
                                                <span className="truncate text-xs">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setSignOutOpen(true)}
                                    >
                                        <LogOut className="size-4" />
                                        <span className="ml-2">Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
        </>
    )
}
