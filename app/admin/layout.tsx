import { AdminSidebarWrapper } from "@/components/admin/sidebar/admin-sidebar-wrapper"
import { SidebarInset } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const session = await auth.api
        .getSession({
            headers: await headers(),
        })
        .catch(() => null)

    if (!session) {
        redirect("/sign-in")
    }

    if (session.user.role !== "admin") {
        redirect("/")
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            image: true,
        },
    })

    if (!adminUser) {
        redirect("/sign-in")
    }

    const sidebarUser = {
        name: adminUser.name,
        displayName: adminUser.displayName,
        email: adminUser.email,
        image: adminUser.image ?? session.user.image ?? null,
    }

    return (
        <AdminSidebarWrapper user={sidebarUser}>
            <SidebarInset
                className={cn(
                    "@container/content",
                    "has-[[data-layout=fixed]]:h-svh",
                    "peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]",
                )}
            >
                {children}
            </SidebarInset>
        </AdminSidebarWrapper>
    )
}
