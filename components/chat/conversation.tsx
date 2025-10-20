"use client"

import { FileUIPart, UIMessage } from "ai"
import { UseChatHelpers } from "@ai-sdk/react"
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { MessageSquare, Paperclip } from "lucide-react"
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
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from "../ai-elements/reasoning"
import {
    Tool,
    ToolContent,
    ToolHeader,
    ToolInput,
    ToolOutput,
} from "../ai-elements/tool"

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
                {messages.map((message) => {
                    const fileFromMessage = message.parts.filter(
                        (part) => part.type === "file",
                    )
                    return (
                        <div
                            key={message.id}
                            className={
                                message.role === "user"
                                    ? "flex flex-col items-end"
                                    : "items-start"
                            }
                        >
                            {fileFromMessage.length > 0 && (
                                <div className="mr-10 mb-[-10] w-fit md:mr-12">
                                    {fileFromMessage.map((part, i) => (
                                        <FileAttachmentPreview
                                            key={`${message.id}-file-${i}`}
                                            part={part as FileUIPart}
                                        />
                                    ))}
                                </div>
                            )}
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
                                            case "reasoning":
                                                return (
                                                    <Reasoning
                                                        key={`${message.id}-${i}`}
                                                        className="w-full"
                                                        isStreaming={
                                                            status ===
                                                                "streaming" &&
                                                            i ===
                                                                message.parts
                                                                    .length -
                                                                    1 &&
                                                            message.id ===
                                                                messages.at(-1)
                                                                    ?.id
                                                        }
                                                    >
                                                        <ReasoningTrigger />
                                                        <ReasoningContent>
                                                            {part.text}
                                                        </ReasoningContent>
                                                    </Reasoning>
                                                )
                                            case "dynamic-tool":
                                                const { toolCallId, state } =
                                                    part

                                                return (
                                                    <Tool
                                                        defaultOpen={true}
                                                        key={toolCallId}
                                                    >
                                                        <ToolHeader
                                                            state={state}
                                                            type="tool-getWeather"
                                                        />
                                                        <ToolContent>
                                                            {state ===
                                                                "input-available" && (
                                                                <ToolInput
                                                                    input={
                                                                        part.input
                                                                    }
                                                                />
                                                            )}
                                                            {state ===
                                                                "output-available" && (
                                                                <ToolOutput
                                                                    errorText={
                                                                        undefined
                                                                    }
                                                                    output={
                                                                        part.output
                                                                    }
                                                                />
                                                            )}
                                                        </ToolContent>
                                                    </Tool>
                                                )
                                            default:
                                                return (
                                                    <Response
                                                        key={`${message.id}-${i}`}
                                                    >
                                                        Thực hiện thành công
                                                    </Response>
                                                )
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
                        </div>
                    )
                })}
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

const FileAttachmentPreview = ({ part }: { part: FileUIPart }) => {
    const candidateName = (part as Record<string, unknown>).name
    const extraName =
        typeof candidateName === "string" ? candidateName : undefined
    const fileName = part.filename ?? extraName ?? "Tệp đính kèm"
    return (
        <div className="border-border bg-muted flex w-full max-w-64 items-center gap-2 rounded-md border px-3 py-2 text-sm md:max-w-none">
            <Paperclip className="text-muted-foreground size-4" />
            <span className="text-foreground flex-1 truncate">{fileName}</span>
        </div>
    )
}
