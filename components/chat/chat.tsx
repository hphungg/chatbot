"use client"

import { useChat } from "@ai-sdk/react"
import { ChatInput } from "./input"
import { generateUUID } from "@/lib/utils"
import { useState } from "react"
import { ChatConversation } from "./conversation"
import { DefaultChatTransport, UIMessage } from "ai"
import { useChatContext } from "@/context/chat-context"
import { getChatById } from "@/app/api/chat/queries"
import { useRouter } from "next/navigation"

interface ChatProps {
    id: string
    initialMessages?: UIMessage[]
}

export function Chat({ id, initialMessages = [] }: ChatProps) {
    const { addChat } = useChatContext()
    const [input, setInput] = useState<string>("")
    const [hasChat, setHasChat] = useState(initialMessages.length > 0)
    const router = useRouter()

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
                        messages: [...request.messages],
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
                    router.refresh()
                }
            }
        },
    })

    return (
        <div className="relative mx-auto h-[calc(100vh-4rem)] rounded-lg">
            <div className="flex h-full flex-col p-2 pt-0">
                <ChatConversation messages={messages} status={status} />
                <div className="flex w-full items-center justify-center bg-transparent pt-2">
                    <ChatInput
                        chatId={id}
                        input={input}
                        setInput={setInput}
                        sendMessage={sendMessage}
                        status={status}
                    />
                </div>
            </div>
        </div>
    )
}
