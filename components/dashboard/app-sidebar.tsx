"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from "../ui/sidebar";
import AppLogo from "../app-logo";
import { sidebarData } from "@/components/dashboard/data/sidebar-data";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { User } from "@/lib/types";

export function AppSidebar({ user }: { user: User }) {
    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo />
            </SidebarHeader>
            <SidebarContent>
                {
                    sidebarData.navGroups.map((group) => (
                        <NavGroup key={group.title} {...group}/>
                    ))
                }
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}