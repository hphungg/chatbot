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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
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
    const [signOutOpen, setSignOutOpen] = useDialogState<boolean>(false)
    const displayName = user.displayName ?? user.name ?? user.email
    const avatarFallback = displayName
        ? displayName.charAt(0).toUpperCase()
        : "A"

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
                    <div className="bg-muted/40 flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage
                                    src={user.image ?? undefined}
                                    alt={displayName ?? "Admin"}
                                />
                                <AvatarFallback>
                                    {avatarFallback}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-sm leading-tight font-semibold">
                                    {displayName}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSignOutOpen(true)}
                            className="shrink-0"
                        >
                            <LogOut className="size-4" />
                            <span className="ml-2">Đăng xuất</span>
                        </Button>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
        </>
    )
}
