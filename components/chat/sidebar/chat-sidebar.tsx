"use client"

import { useEffect, useMemo } from "react"
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
import { getGroupsByUserId, deleteGroupById } from "@/app/api/group/queries"

export function ChatSidebar({ user }: { user: any }) {
    const {
        chatHistory,
        setChatHistory,
        removeChat,
        groups,
        setGroups,
        removeGroups,
        setOpen,
    } = useChatContext()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        async function fetchData() {
            try {
                const [chatsResponse, groupsResponse] = await Promise.all([
                    getChatsByUserId(user.id),
                    getGroupsByUserId(user.id),
                ])
                setChatHistory(chatsResponse)
                setGroups(groupsResponse)
            } catch (error) {
                console.error("Error loading chat data:", error)
            }
        }
        fetchData()
    }, [user.id, setChatHistory, setGroups])

    const groupChatMap = useMemo(() => {
        const map = new Map<string, typeof chatHistory>()
        chatHistory.forEach((chat) => {
            if (!chat.groupId) {
                return
            }
            if (!map.has(chat.groupId)) {
                map.set(chat.groupId, [])
            }
            map.get(chat.groupId)?.push(chat)
        })
        return map
    }, [chatHistory])

    const individualChats = useMemo(
        () => chatHistory.filter((chat) => !chat.groupId),
        [chatHistory],
    )

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

    const handleDeleteGroup = async (groupId: string) => {
        try {
            await deleteGroupById(groupId)
            removeGroups(groupId)
            setChatHistory((prevChats) =>
                prevChats.map((chat) =>
                    chat.groupId === groupId
                        ? {
                              ...chat,
                              groupId: null,
                          }
                        : chat,
                ),
            )
            toast.success("Xóa dự án thành công")
            if (pathname.startsWith(`/chat/group/${groupId}`)) {
                router.push("/chat")
            }
        } catch (error) {
            console.error("Error deleting group:", error)
            toast.error("Xóa dự án thất bại")
        }
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
                        Tạo dự án mới
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="mt-1">
                    <SidebarGroupLabel>Dự án</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {groups.map((group) => {
                                const isActive = pathname.startsWith(
                                    `/chat/group/${group.id}`,
                                )
                                const chatsInGroup =
                                    groupChatMap.get(group.id) ?? []

                                return (
                                    <Collapsible
                                        defaultOpen={isActive}
                                        key={group.id}
                                    >
                                        <SidebarMenuItem>
                                            <div className="flex items-center">
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        asChild
                                                        className={
                                                            isActive
                                                                ? "bg-gray-200 hover:bg-gray-200"
                                                                : ""
                                                        }
                                                    >
                                                        <Link
                                                            href={`/chat/group/${group.id}`}
                                                        >
                                                            <span>
                                                                {group.title ||
                                                                    "Dự án không có tiêu đề"}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                <DropdownMenu
                                                    modal={true}
                                                    defaultOpen={true}
                                                >
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <SidebarMenuAction
                                                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ml-1"
                                                            showOnHover={
                                                                !isActive
                                                            }
                                                        >
                                                            <MoreHorizontalIcon />
                                                            <span className="sr-only">
                                                                Thêm
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
                                                                handleDeleteGroup(
                                                                    group.id,
                                                                )
                                                            }
                                                        >
                                                            <TrashIcon />
                                                            <span>
                                                                Xóa dự án
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {chatsInGroup.length ===
                                                    0 ? (
                                                        <SidebarMenuSubItem>
                                                            <span className="text-muted-foreground px-2 text-sm">
                                                                Chưa có cuộc trò
                                                                chuyện
                                                            </span>
                                                        </SidebarMenuSubItem>
                                                    ) : (
                                                        chatsInGroup.map(
                                                            (chat) => {
                                                                const chatActive =
                                                                    pathname ===
                                                                    `/chat/${chat.id}`

                                                                return (
                                                                    <SidebarMenuSubItem
                                                                        key={
                                                                            chat.id
                                                                        }
                                                                    >
                                                                        <div className="flex w-full items-center">
                                                                            <SidebarMenuButton
                                                                                asChild
                                                                                className={
                                                                                    chatActive
                                                                                        ? "bg-gray-200 hover:bg-gray-200"
                                                                                        : ""
                                                                                }
                                                                            >
                                                                                <Link
                                                                                    href={`/chat/${chat.id}`}
                                                                                >
                                                                                    <span>
                                                                                        {chat.title ||
                                                                                            "Untitled Chat"}
                                                                                    </span>
                                                                                </Link>
                                                                            </SidebarMenuButton>
                                                                            <DropdownMenu
                                                                                modal={
                                                                                    true
                                                                                }
                                                                            >
                                                                                <DropdownMenuTrigger
                                                                                    asChild
                                                                                >
                                                                                    <SidebarMenuAction
                                                                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ml-1"
                                                                                        showOnHover={
                                                                                            !chatActive
                                                                                        }
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
                                                                                        <span>
                                                                                            Xóa
                                                                                        </span>
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>
                                                                    </SidebarMenuSubItem>
                                                                )
                                                            },
                                                        )
                                                    )}
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
                            {individualChats.map((chat) => {
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
