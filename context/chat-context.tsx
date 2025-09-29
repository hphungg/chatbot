"use client"

import { Chat } from "@prisma/client";
import { createContext, useContext, ReactNode, useState } from "react";

interface ChatContextType {
    chats: Chat[];
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    addChat: (chat: Chat) => void;
    removeChat: (chatId: string) => void;
    groups: Chat[];
    setGroups: React.Dispatch<React.SetStateAction<Chat[]>>;
    addGroups: (group: Chat) => void;
    removeGroups: (groupId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [groups, setGroups] = useState<Chat[]>([]);

    const addChat = (chat: Chat) => {
        setChats(prevChats => {
            const exists = prevChats.some(existingChat => existingChat.id === chat.id);
            if (exists) {
                return prevChats;
            }
            return [chat, ...prevChats];
        });
    };

    const addGroups = (group: Chat) => {
        setGroups(prevGroups => {
            const exists = prevGroups.some(existingGroup => existingGroup.id === group.id);
            if (exists) {
                return prevGroups;
            }
            return [group, ...prevGroups];
        });
    };

    const removeChat = (chatId: string) => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    };

    const removeGroups = (groupId: string) => {
        setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
    }

    return (
        <ChatContext.Provider value={{
            chats,
            setChats,
            addChat,
            removeChat,
            groups,
            setGroups,
            addGroups,
            removeGroups
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}