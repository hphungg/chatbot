import { AdminSidebar } from "@/components/admin/sidebar/admin-sidebar"
import { AdminSearchProvider } from "@/context/admin-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <AdminSearchProvider>
            <SidebarProvider defaultOpen>
                <AdminSidebar />
                <SidebarInset
                    className={cn(
                        "@container/content",
                        "has-[[data-layout=fixed]]:h-svh",
                        "peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]",
                    )}
                >
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </AdminSearchProvider>
    )
}
