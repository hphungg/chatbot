import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar/dashboard-sidebar"
import { DashboardSearchProvider } from "@/context/dashboard-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { User } from "@prisma/client"

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const session = await auth.api
        .getSession({
            headers: await headers(),
        })
        .catch((e) => {
            console.error(e)
            throw redirect("/sign-in")
        })

    if (!session) {
        return redirect("/sign-in")
    }

    const user = session.user

    return (
        <DashboardSearchProvider>
            <SidebarProvider defaultOpen={true}>
                <DashboardSidebar user={user} />
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
        </DashboardSearchProvider>
    )
}
