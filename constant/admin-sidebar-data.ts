import { type ComponentType, type SVGProps } from "react"
import { ShieldCheck, Users, Building2 } from "lucide-react"

export interface AdminSidebarItem {
    title: string
    url: string
    icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const adminSidebarData: AdminSidebarItem[] = [
    {
        title: "Tổng quan",
        url: "/admin",
        icon: ShieldCheck,
    },
    {
        title: "Người dùng",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Phòng ban",
        url: "/admin/departments",
        icon: Building2,
    },
]
