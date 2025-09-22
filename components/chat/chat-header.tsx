"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";
import { useSidebar } from "../ui/sidebar";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "./sidebar-toggle";
import { Button } from "../ui/button";
import { PlusIcon } from "../icons";

function PureChatHeader({ chatId }: { chatId: string }) {
    const router = useRouter();
    const { open } = useSidebar();
    const { width: windowWidth } = useWindowSize();

    return (
        <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
            <SidebarToggle />
            {(!open || windowWidth < 768) && (
                <Button
                    className="order-2 ml-auto h-8 px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
                    onClick={() => {
                        router.push("/");
                        router.refresh();
                    }}
                    variant="outline"
                >
                    <PlusIcon />
                    <span className="md:sr-only">New Chat</span>
                </Button>
            )}
        </header>
    )
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
    return (
        prevProps.chatId === nextProps.chatId
    )
})