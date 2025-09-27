"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./input";
import { generateUUID } from "@/lib/utils";
import { Attachment, ChatMessage } from "@/lib/types";
import { useState } from "react";
import { ChatConversation } from "./conversation";

interface ChatProps {
    id: string;
}

export function Chat( {
    id
}: ChatProps) {
    const {
        messages,
        setMessages,
        sendMessage,
        status,
        stop,
        regenerate,
    } = useChat<ChatMessage>({
        id,
        generateId: generateUUID,
    });

    const [ input, setInput ] = useState<string>("");
    const [ attachments, setAttachments ] = useState<Attachment[]>([]);

    return (
        <div className="max-w-4xl mx-auto pb-2 relative size-full h-[calc(100vh-4rem)] rounded-lg">
            <div className="flex flex-col h-full">
                <ChatConversation
                    messages={messages}
                />
                <ChatInput
                    chatId={id}
                    input={input}
                    setInput={setInput}
                    messages={messages}
                    setMessages={setMessages}
                    sendMessage={sendMessage}
                    status={status}
                    stop={stop}
                    attachments={attachments}
                    setAttachments={setAttachments}
                />
            </div>
        </div>
    )
}