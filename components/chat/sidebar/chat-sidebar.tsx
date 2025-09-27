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
} from "@/components/ui/sidebar";
import AppLogo from "@/components/app-logo";
import { User } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { BotIcon } from "lucide-react";

export function ChatSidebar({ user }: { user: User }) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo className="ml-1" />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-2">
                    <SidebarMenu>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Link className={buttonVariants({ variant: "outline", className: "w-full mb-2" })} href="/">
                    <BotIcon className="size-4" /> Back to Dashboard
                </Link>
            </SidebarFooter>
        </Sidebar>
    )
}