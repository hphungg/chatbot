"use client"

import { Chat } from "@prisma/client";
import { createContext, useContext, ReactNode, useState } from "react";

interface ChatContextType {
    chats: Chat[];
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    addChat: (chat: Chat) => void;
    removeChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<Chat[]>([]);

    const addChat = (chat: Chat) => {
        setChats(prevChats => {
            const exists = prevChats.some(existingChat => existingChat.id === chat.id);
            if (exists) {
                return prevChats;
            }
            return [chat, ...prevChats];
        });
    };

    const removeChat = (chatId: string) => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    };

    return (
        <ChatContext.Provider value={{
            chats,
            setChats,
            addChat,
            removeChat
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