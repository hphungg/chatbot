"use client"

import { useChat } from "@ai-sdk/react"
import { ChatInput } from "./input"
import { generateUUID } from "@/lib/utils"
import { useState } from "react"
import { ChatConversation } from "./conversation"
import { DefaultChatTransport, UIMessage } from "ai"
import { useChatContext } from "@/context/chat-context"
import { getChatById } from "@/app/api/chat/queries"

interface ChatProps {
    id: string
    initialMessages?: UIMessage[]
}

export function Chat({ id, initialMessages = [] }: ChatProps) {
    const { addChat } = useChatContext()
    const [input, setInput] = useState<string>("")
    const [chatCreated, setChatCreated] = useState(initialMessages.length > 0)

    const { messages, sendMessage, status } = useChat({
        id,
        messages: initialMessages,
        generateId: generateUUID,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            prepareSendMessagesRequest(request) {
                return {
                    body: {
                        chatId: request.id,
                        message: request.messages.at(-1),
                        ...request.body,
                    },
                }
            },
        }),
        onFinish: async () => {
            if (!chatCreated && initialMessages.length === 0) {
                try {
                    const newChat = await getChatById(id)
                    if (newChat) {
                        addChat(newChat)
                        setChatCreated(true)
                    }
                } catch (error) {
                    console.error("Error fetching new chat:", error)
                }
            }
        },
    })

    return (
        <div className="relative mx-auto size-full h-[calc(100vh-4rem)] max-w-3xl rounded-lg">
            <div className="flex h-full flex-col p-2">
                <ChatConversation messages={messages} status={status} />
                <ChatInput
                    chatId={id}
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    status={status}
                />
            </div>
        </div>
    )
}
