"use client"

import { Chat, Group } from "@prisma/client"
import { createContext, useContext, ReactNode, useState } from "react"

interface ChatContextType {
    chats: Chat[]
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>
    addChat: (chat: Chat) => void
    removeChat: (chatId: string) => void
    groups: Group[]
    setGroups: React.Dispatch<React.SetStateAction<Group[]>>
    addGroups: (group: Group) => void
    removeGroups: (groupId: string) => void
    open: GroupDialogType | null
    setOpen: (str: GroupDialogType | null) => void
}

type GroupDialogType = "create-group" | "edit" | "delete" | "view"

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<Chat[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [open, setOpen] = useState<GroupDialogType | null>(null)

    const addChat = (chat: Chat) => {
        setChats((prevChats) => {
            const exists = prevChats.some(
                (existingChat) => existingChat.id === chat.id,
            )
            if (exists) {
                return prevChats
            }
            return [chat, ...prevChats]
        })
    }

    const addGroups = (group: Group) => {
        setGroups((prevGroups) => {
            const exists = prevGroups.some(
                (existingGroup) => existingGroup.id === group.id,
            )
            if (exists) {
                return prevGroups
            }
            return [group, ...prevGroups]
        })
    }

    const removeChat = (chatId: string) => {
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
    }

    const removeGroups = (groupId: string) => {
        setGroups((prevGroups) =>
            prevGroups.filter((group) => group.id !== groupId),
        )
    }

    return (
        <ChatContext.Provider
            value={{
                chats,
                setChats,
                addChat,
                removeChat,
                groups,
                setGroups,
                addGroups,
                removeGroups,
                open,
                setOpen,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export function useChatContext() {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error("useChatContext must be used within a ChatProvider")
    }
    return context
}
