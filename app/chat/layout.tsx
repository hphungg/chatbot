import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/sidebar/chat-sidebar";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChatProvider } from "@/context/chat-context";
import { CreateGroupDialog } from "@/components/group/create-group-dialog";

export default async function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
        <SidebarProvider defaultOpen={true}>
            <ChatProvider>
                <ChatSidebar user={user} />
                <SidebarInset
                    className={cn(
                        '@container/content', 'has-[[data-layout=fixed]]:h-svh', 'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
                    )}
                >
                    {children}
                </SidebarInset>
                <CreateGroupDialog />
            </ChatProvider>
        </SidebarProvider>
    );
}