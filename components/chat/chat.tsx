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
    groupId?: string
}

export function Chat({ id, initialMessages = [], groupId }: ChatProps) {
    const { addChat } = useChatContext()
    const [input, setInput] = useState<string>("")
    const [hasChat, setHasChat] = useState(initialMessages.length > 0)
    const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini")

    const { messages, sendMessage, status, stop } = useChat({
        id,
        messages: initialMessages,
        generateId: generateUUID,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            prepareSendMessagesRequest(request) {
                const baseBody = {
                    chatId: request.id,
                    messages: [...request.messages],
                    model: selectedModel,
                }
                return {
                    body: {
                        ...baseBody,
                        ...(groupId ? { groupId } : {}),
                        ...request.body,
                    },
                }
            },
        }),
        onFinish: async () => {
            if (!hasChat) {
                const newChat = await getChatById(id)
                if (newChat) {
                    addChat(newChat)
                    setHasChat(true)
                }
            }
        },
    })

    return (
        <div className="relative mx-auto h-[calc(100vh-4rem)] rounded-lg">
            <div className="flex h-full flex-col pb-2">
                <ChatConversation messages={messages} status={status} />
                <div className="flex w-full items-center justify-center bg-transparent pt-1">
                    <ChatInput
                        input={input}
                        setInput={setInput}
                        sendMessage={sendMessage}
                        status={status}
                        stop={stop}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                    />
                </div>
            </div>
        </div>
    )
}
