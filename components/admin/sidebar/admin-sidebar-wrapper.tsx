"use client"

import { useEffect, useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./admin-sidebar"

interface AdminSidebarWrapperProps {
    user: {
        name: string | null
        displayName: string | null
        email: string
        image: string | null
    }
    children: React.ReactNode
}

export function AdminSidebarWrapper({
    user,
    children,
}: AdminSidebarWrapperProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <SidebarProvider defaultOpen>
            {mounted && <AdminSidebar user={user} />}
            {children}
        </SidebarProvider>
    )
}
