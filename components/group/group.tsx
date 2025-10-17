"use client"

import { useChatContext } from "@/context/chat-context"
import { ChatInput } from "../chat/input"
import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { generateUUID } from "@/lib/utils"
import { DefaultChatTransport } from "ai"
import { getChatById } from "@/app/api/chat/queries"

interface GroupProps {
    id: string
}

export function Group({ id }: GroupProps) {
    const { addChat } = useChatContext()
    const [input, setInput] = useState<string>("")

    const { sendMessage, status } = useChat({
        id,
        messages: [],
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
            try {
                const newChat = await getChatById(id)
                if (newChat) {
                    addChat(newChat)
                }
            } catch (error) {
                console.error("Error fetching new chat:", error)
            }
        },
    })

    return (
        <div className="relative mx-auto size-full h-[calc(100vh-4rem)] max-w-4xl rounded-lg">
            <div className="flex h-full flex-col p-2">
                <span className="mt-2 items-center justify-center font-bold">
                    Start creating new chat in this group
                </span>
                <ChatInput
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    status={status}
                />
            </div>
        </div>
    )
}
