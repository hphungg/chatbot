"use client";

import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import {
    IconDashboard,
    IconFolder,
    IconHome,
    IconUsers,
} from "@tabler/icons-react"
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const fixedData = {
    navMain: [
        {
            title: "Dashboard",
            url: "#",
            icon: IconDashboard,
        },
        {
            title: "Users",
            url: "/dashboard/users",
            icon: IconUsers,
        },
        {
            title: "Departments",
            url: "/dashboard/departments",
            icon: IconHome,
        },
        {
            title: "Projects",
            url: "/dashboard/projects",
            icon: IconFolder,
        }
    ],
    user: {
        name: "Phi Hung",
        email: "phi.hung@example.com"
    }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                        >
                            <Link href="/">
                                ChatBot
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={fixedData.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={fixedData.user} />
            </SidebarFooter>
        </Sidebar>
    )
}