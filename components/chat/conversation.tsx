import { UIMessage } from "ai"
import { UseChatHelpers } from "@ai-sdk/react"
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { MessageSquare } from "lucide-react"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Response } from "@/components/ai-elements/response"
import { cn } from "@/lib/utils"
import { Spinner } from "../ui/spinner"

interface ChatConversationProps {
    messages: UIMessage[]
    status: UseChatHelpers<UIMessage>["status"]
}

export function ChatConversation({ messages, status }: ChatConversationProps) {
    const hasMessages = messages.length > 0

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
                                "text-[16px] leading-relaxed",
                                message.role === "assistant"
                                    ? "p-1"
                                    : "px-3 py-2",
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
                    </Message>
                ))}
                {status === "submitted" && (
                    <div className="flex flex-row items-center gap-2">
                        <Spinner /> Đang nghĩ...
                    </div>
                )}
            </ConversationContent>
            <ConversationScrollButton />
        </Conversation>
    )
}
