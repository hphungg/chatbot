"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import AppLogo from "@/components/app-logo";
import { sidebarData } from "@/constant/sidebar-data";
import { DashboardUser } from "./dashboard-user";
import { User } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { BotIcon } from "lucide-react";

export function DashboardSidebar({ user }: { user: User }) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo className="ml-1" />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-2">
                    <SidebarMenu>
                        {
                            sidebarData.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className={isActive ? "bg-black text-white hover:bg-gray-800 hover:text-white" : ""}
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })
                        }
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Link className={buttonVariants({ variant: "outline", className: "w-full mb-2" })} href="/chat">
                    <BotIcon className="size-4" /> Chat with LLM
                </Link>
                <DashboardUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}