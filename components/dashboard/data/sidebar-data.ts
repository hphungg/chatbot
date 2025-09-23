import { IconDashboard, IconFolder, IconHome } from "@tabler/icons-react";
import { Users } from "lucide-react";
import { type SidebarData } from "./types";

export const sidebarData: SidebarData = {
    navGroups: [
        {
            title: "General",
            items: [
                {
                    title: "Dashboard",
                    url: "/",
                    icon: IconDashboard,
                },
                {
                    title: "Departments",
                    url: "/departments",
                    icon: IconHome,
                },
                {
                    title: "Users",
                    url: "/users",
                    icon: Users,
                },
                {
                    title: "Projects",
                    url: "/projects",
                    icon: IconFolder,
                }
            ]
        }
    ]
}