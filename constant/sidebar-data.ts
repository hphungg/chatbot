import {
    IconDashboard,
    IconFolder,
    IconHome,
    IconUser,
    IconUsersGroup,
} from "@tabler/icons-react"
import { Users } from "lucide-react"

export const sidebarData = [
    {
        title: "Tổng quan",
        url: "/",
        icon: IconDashboard,
    },
    {
        title: "Phòng ban",
        url: "/departments",
        icon: IconHome,
    },
    {
        title: "Nhân viên",
        url: "/users",
        icon: Users,
    },
    {
        title: "Nhóm của tôi",
        url: "/team",
        icon: IconUsersGroup,
        roles: ["manager"],
    },
    {
        title: "Dự án",
        url: "/projects",
        icon: IconFolder,
    },
    {
        title: "Thông tin cá nhân",
        url: "/manage-profile",
        icon: IconUser,
    },
]
