"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./input";
import { fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Attachment, ChatMessage } from "@/lib/types";
import { useState } from "react";
import { ChatConversation } from "./conversation";
import { DefaultChatTransport } from "ai";

interface ChatProps {
    id: string;
    initialMessages?: ChatMessage[];
}

export function Chat( {
    id,
    initialMessages = []
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
        messages: initialMessages,
        generateId: generateUUID,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            fetch: fetchWithErrorHandlers,
            prepareSendMessagesRequest(request) {
                return {
                    body: {
                        id: request.id,
                        message: request.messages.at(-1),
                        ...request.body,
                    }
                }
            }
        })
    });

    const [ input, setInput ] = useState<string>("");
    const [ attachments, setAttachments ] = useState<Attachment[]>([]);

    return (
        <div className="max-w-4xl mx-auto relative size-full h-[calc(100vh-4rem)] rounded-lg">
            <div className="flex flex-col h-full p-2">
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