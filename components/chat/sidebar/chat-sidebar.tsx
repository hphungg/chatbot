"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import AppLogo from "@/components/app-logo";
import { User } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { BotIcon, MoreHorizontalIcon, TrashIcon, PlusIcon } from "lucide-react";
import { deleteChatById, getChatsByUserId } from "@/app/api/chat/queries";
import { Chat } from "@prisma/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SidebarUser } from "./sidebar-user";

export function ChatSidebar({ user }: { user: User }) {
    const [ chats, setChats ] = useState<Chat[]>([]);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        async function fetchChats() {
            try {
                const response = await getChatsByUserId(user.id);
                setChats(response);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        }
        fetchChats();
    }, []);

    const handleDeleteChat = async (chatId: string) => {
        try {
            await deleteChatById(chatId);
            setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
            toast.success("Chat deleted successfully");
            if (pathname === `/chat/${chatId}`) {
                router.push("/chat");
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error("Failed to delete chat");
        }
    }

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo className="ml-1" />
                <Link
                    href="/chat"
                    className={buttonVariants({
                        variant: "outline",
                        className: "w-full mt-3 mb-1"
                    })}
                >
                    <PlusIcon className="size-4" />
                    New Chat
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-2">
                    <SidebarGroupLabel>Chats</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chats.map((chat) => {
                                const isActive = pathname === `/chat/${chat.id}`;
                                return (
                                    <SidebarMenuItem key={chat.id}>
                                        <SidebarMenuButton
                                            asChild
                                            className={isActive ? "bg-gray-200 hover:bg-gray-200" : ""}
                                        >
                                            <Link href={`/chat/${chat.id}`} className="w-full h-full">
                                                {chat.title || "Untitled Chat"}
                                            </Link>
                                        </SidebarMenuButton>
                                        <DropdownMenu modal={true}>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuAction
                                                    className="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                                    showOnHover={!isActive}
                                                >
                                                    <MoreHorizontalIcon />
                                                    <span className="sr-only">More</span>
                                                </SidebarMenuAction>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" side="bottom">
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                                                    onSelect={() => handleDeleteChat(chat.id)}
                                                >
                                                    <TrashIcon />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}