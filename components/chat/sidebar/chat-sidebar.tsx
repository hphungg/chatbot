"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
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
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import AppLogo from "@/components/app-logo"
import { User } from "@/lib/types"
import { Button, buttonVariants } from "@/components/ui/button"
import { MoreHorizontalIcon, TrashIcon, PlusIcon, Folder } from "lucide-react"
import { deleteChatById, getChatsByUserId } from "@/app/api/chat/queries"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { SidebarUser } from "./sidebar-user"
import { useChatContext } from "@/context/chat-context"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getGroupsByUserId } from "@/app/api/group/queries"

export function ChatSidebar({ user }: { user: User }) {
    const {
        chats,
        setChats,
        removeChat,
        groups,
        setGroups,
        removeGroups,
        open,
        setOpen,
    } = useChatContext()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        async function fetchChats() {
            try {
                const response = await getChatsByUserId(user.id)
                setChats(response)
            } catch (error) {
                console.error("Error fetching chats:", error)
            }
        }
        async function fetchGroups() {
            try {
                const response = await getGroupsByUserId(user.id)
                setGroups(response)
            } catch (error) {
                console.error("Error fetching groups:", error)
            }
        }
        fetchGroups()
        fetchChats()
    }, [user.id, setChats])

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await getGroupsByUserId(user.id)
                setGroups(response)
            } catch (error) {
                console.error("Error fetching groups:", error)
            }
        }
        fetchGroups()
    }, [user.id, setGroups])

    const handleDeleteChat = async (chatId: string) => {
        try {
            await deleteChatById(chatId)
            removeChat(chatId)
            toast.success("Xóa cuộc trò chuyện thành công")
            if (pathname === `/chat/${chatId}`) {
                router.push("/chat")
            }
        } catch (error) {
            console.error("Error deleting chat:", error)
            toast.error("Xóa cuộc trò chuyện thất bại")
        }
    }

    const handleCreateGroupChat = () => {
        setOpen("create-group")
    }

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <AppLogo className="ml-1" />
                <div className="space-y-1">
                    <Link
                        href="/chat"
                        className={buttonVariants({
                            variant: "ghost",
                            className: "mt-3 w-full justify-start",
                        })}
                    >
                        <PlusIcon className="mr-2 size-4" />
                        Tạo cuộc trò chuyện
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleCreateGroupChat}
                    >
                        <Folder className="mr-2 size-4" />
                        Tạo nhóm chat mới
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-1">
                    <SidebarGroupLabel>Nhóm chat</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {groups.map((group) => {
                                const isActive =
                                    pathname === `/chat/${group.id}`
                                return (
                                    <Collapsible
                                        defaultOpen={false}
                                        key={group.id}
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    asChild
                                                    className="cursor-pointer"
                                                >
                                                    <Link href={`/chat/group`}>
                                                        <span>
                                                            {group.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    <SidebarMenuSubItem
                                                        key={group.id}
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                            className={
                                                                isActive
                                                                    ? "bg-gray-200 hover:bg-gray-200"
                                                                    : ""
                                                            }
                                                        >
                                                            <Link
                                                                href={`/chat/${group.id}`}
                                                            >
                                                                <span>
                                                                    {group.title ||
                                                                        "Untitled Group"}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup className="mt-1">
                    <SidebarGroupLabel>Cuộc trò chuyện</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chats.map((chat) => {
                                const isActive = pathname === `/chat/${chat.id}`
                                return (
                                    <SidebarMenuItem key={chat.id}>
                                        <SidebarMenuButton
                                            asChild
                                            className={
                                                isActive
                                                    ? "bg-gray-200 hover:bg-gray-200"
                                                    : ""
                                            }
                                        >
                                            <Link href={`/chat/${chat.id}`}>
                                                <span>
                                                    {chat.title ||
                                                        "Untitled Chat"}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                        <DropdownMenu modal={true}>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuAction
                                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
                                                    showOnHover={!isActive}
                                                >
                                                    <MoreHorizontalIcon />
                                                    <span className="sr-only">
                                                        More
                                                    </span>
                                                </SidebarMenuAction>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="end"
                                                side="bottom"
                                            >
                                                <DropdownMenuItem
                                                    className="text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer dark:text-red-500"
                                                    onSelect={() =>
                                                        handleDeleteChat(
                                                            chat.id,
                                                        )
                                                    }
                                                >
                                                    <TrashIcon />
                                                    <span>Xóa</span>
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
