import { AppHeader } from "@/components/dashboard/app-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchProvider } from "@/components/providers/search-provider";
import { Search } from "@/components/search";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    }).catch((e) => {
        console.error(e);
        throw redirect("/sign-in");
    });

    if (!session) {
        return redirect("/sign-in");
    }

    const user: User = session.user;

    return (
        <SearchProvider>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar user={user} />
                <SidebarInset
                    className={cn(
                        '@container/content', 'has-[[data-layout=fixed]]:h-svh', 'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
                    )}
                >
                    <AppHeader>
                        <Search />
                    </AppHeader>
                </SidebarInset>
            </SidebarProvider>
        </SearchProvider>
    )
}