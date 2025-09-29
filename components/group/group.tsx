"use client"

import { useChatContext } from "@/context/chat-context"
import { ChatInput } from "../chat/input"
import { useState } from "react"
import { Attachment } from "@/lib/types"
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
    const [attachments, setAttachments] = useState<Attachment[]>([])

    const { messages, setMessages, sendMessage, status, stop } = useChat({
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
        <div className="max-w-4xl mx-auto relative size-full h-[calc(100vh-4rem)] rounded-lg">
            <div className="flex flex-col h-full p-2">
                <span className="font-bold mt-2 justify-center items-center">
                    Start creating new chat in this group
                </span>
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
