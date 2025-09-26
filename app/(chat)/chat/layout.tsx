import Script from "next/script";
import { AppSidebar } from "@/components/chat/sidebar-app";
import { DataStreamProvider } from "@/context/data-stream-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const experimental_ppr = true;

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const [session, cookieStore] = await Promise.all([auth(), cookies()]);
    // const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
                strategy="beforeInteractive"
            />
            <DataStreamProvider>
                <SidebarProvider defaultOpen={true}>
                <AppSidebar user={undefined} />
                    <SidebarInset>{children}</SidebarInset>
                </SidebarProvider>
            </DataStreamProvider>
        </>
    );
}