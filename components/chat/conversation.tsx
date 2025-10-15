"use client"

import { UIMessage } from "ai"
import { UseChatHelpers } from "@ai-sdk/react"
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { MessageSquare } from "lucide-react"
import {
    Message,
    MessageAvatar,
    MessageContent,
} from "@/components/ai-elements/message"
import { Response } from "@/components/ai-elements/response"
import { cn } from "@/lib/utils"
import { Spinner } from "../ui/spinner"
import { useChatContext } from "@/context/chat-context"
import { TextShimmer } from "../ui/text-shimmer"

interface ChatConversationProps {
    messages: UIMessage[]
    status: UseChatHelpers<UIMessage>["status"]
}

export function ChatConversation({ messages, status }: ChatConversationProps) {
    const { currentUser } = useChatContext()
    const hasMessages = messages.length > 0
    const userAvatarSrc = currentUser?.image ?? ""
    const userAvatarName = currentUser?.displayName ?? currentUser?.name ?? ""

    return (
        <Conversation className="h-full">
            <ConversationContent>
                {!hasMessages && (
                    <ConversationEmptyState
                        className="flex-1"
                        title="Bắt đầu cuộc trò chuyện"
                        description="Gửi tin nhắn để bắt đầu cuộc trò chuyện."
                        icon={<MessageSquare className="size-12" />}
                    />
                )}
                {messages.map((message) => (
                    <Message from={message.role} key={message.id}>
                        <MessageContent
                            variant={
                                message.role === "assistant"
                                    ? "flat"
                                    : "contained"
                            }
                            className={cn(
                                "leading-relaxed md:text-lg",
                                message.role === "assistant"
                                    ? "p-2"
                                    : "px-4 py-2",
                            )}
                        >
                            {message.parts.map((part, i) => {
                                switch (part.type) {
                                    case "text":
                                        return (
                                            <Response
                                                key={`${message.id}-${i}`}
                                            >
                                                {part.text}
                                            </Response>
                                        )
                                    default:
                                        return null
                                }
                            })}
                        </MessageContent>
                        {message.role === "user" && (
                            <MessageAvatar
                                src={userAvatarSrc}
                                name={userAvatarName}
                                className="size-8 md:size-10"
                            />
                        )}
                    </Message>
                ))}
                {status === "submitted" && (
                    <div className="flex flex-row items-center">
                        <Spinner className="mr-2" />
                        <TextShimmer className="text-lg" duration={1}>
                            Đang nghĩ...
                        </TextShimmer>
                    </div>
                )}
            </ConversationContent>
            <ConversationScrollButton className="border-2 border-gray-500" />
        </Conversation>
    )
}
