import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header"
import { Search } from "@/components/search"
import { DisplayNameForm } from "./_components/display-name-form"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function ManageProfilePage() {
    const session = await auth.api
        .getSession({
            headers: await headers(),
        })
        .catch(() => null)

    if (!session || !session.user) {
        redirect("/sign-in")
    }

    const sessionUser = session.user

    const currentUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: {
            email: true,
            name: true,
            displayName: true,
        },
    })

    if (!currentUser) {
        redirect("/sign-in")
    }

    const fallbackName =
        currentUser.name ?? sessionUser.name ?? sessionUser.email ?? ""
    const email = currentUser.email ?? sessionUser.email ?? ""

    return (
        <>
            <DashboardHeader fixed>
                <h1 className="text-2xl font-bold tracking-tight">
                    Cập nhật thông tin cá nhân
                </h1>
            </DashboardHeader>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <div className="text-muted-foreground text-sm">
                                Email
                            </div>
                            <div className="font-medium">{email}</div>
                        </div>
                        <DisplayNameForm
                            initialDisplayName={currentUser.displayName ?? null}
                            fallbackName={fallbackName}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
