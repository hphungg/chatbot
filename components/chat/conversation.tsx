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

    const renderToolPart = (part: any, messageId: string, index: number) => {
        if (part.type === "dynamic-tool") {
            const { toolCallId, toolName, state } = part
            return (
                <Tool
                    defaultOpen={
                        state === "input-streaming" ||
                        state === "input-available"
                    }
                    key={toolCallId}
                >
                    <ToolHeader
                        state={state}
                        type={`tool-${toolName}` as `tool-${string}`}
                    />
                    <ToolContent>
                        {(state === "input-streaming" ||
                            state === "input-available") && (
                            <ToolInput input={part.input} />
                        )}
                        {state === "output-available" && (
                            <ToolOutput
                                errorText={undefined}
                                output={part.output}
                            />
                        )}
                        {state === "output-error" && (
                            <ToolOutput
                                errorText={part.errorText}
                                output={undefined}
                            />
                        )}
                    </ToolContent>
                </Tool>
            )
        }

        if (part.type.startsWith("tool-")) {
            return (
                <Tool
                    defaultOpen={
                        part.state === "input-streaming" ||
                        part.state === "input-available"
                    }
                    key={`${messageId}-tool-${index}`}
                >
                    <ToolHeader
                        state={part.state}
                        type={part.type as `tool-${string}`}
                    />
                    <ToolContent>
                        {(part.state === "input-streaming" ||
                            part.state === "input-available") && (
                            <ToolInput input={part.input} />
                        )}
                        {part.state === "output-available" && (
                            <ToolOutput
                                errorText={undefined}
                                output={part.output}
                            />
                        )}
                        {part.state === "output-error" && (
                            <ToolOutput
                                errorText={part.errorText}
                                output={undefined}
                            />
                        )}
                    </ToolContent>
                </Tool>
            )
        }

        return null
    }

    const getToolParts = (message: UIMessage) => {
        return message.parts.filter(
            (part) =>
                part.type === "dynamic-tool" || part.type.startsWith("tool-"),
        )
    }

    const getTextAndReasoningParts = (message: UIMessage) => {
        return message.parts.filter(
            (part) => part.type === "text" || part.type === "reasoning",
        )
    }

    const hasTextContent = (message: UIMessage) => {
        const textParts = getTextAndReasoningParts(message)
        return textParts.some((part) => {
            if (part.type === "text") {
                return part.text && part.text.trim().length > 0
            }
            return true
        })
    }

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
                    const toolParts = getToolParts(message)
                    const textParts = getTextAndReasoningParts(message)
                    const hasText = hasTextContent(message)

                    return (
                        <div
                            key={message.id}
                            className={cn(
                                "flex flex-col gap-2",
                                message.role === "user"
                                    ? "items-end"
                                    : "items-start",
                            )}
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

                            {/* Tool calls section - hiển thị riêng */}
                            {message.role === "assistant" &&
                                toolParts.length > 0 && (
                                    <div className="flex w-full max-w-[85%] flex-col gap-2">
                                        {toolParts.map((part, i) =>
                                            renderToolPart(part, message.id, i),
                                        )}
                                    </div>
                                )}

                            {/* Text message section - luôn hiển thị như tin nhắn chat */}
                            {(hasText || message.role === "user") && (
                                <Message from={message.role}>
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
                                        {textParts.map((part, i) => {
                                            switch (part.type) {
                                                case "text":
                                                    return (
                                                        <Response
                                                            key={`${message.id}-text-${i}`}
                                                        >
                                                            {part.text}
                                                        </Response>
                                                    )
                                                case "reasoning":
                                                    return (
                                                        <Reasoning
                                                            key={`${message.id}-reasoning-${i}`}
                                                            className="w-full"
                                                            isStreaming={
                                                                status ===
                                                                    "streaming" &&
                                                                i ===
                                                                    textParts.length -
                                                                        1 &&
                                                                message.id ===
                                                                    messages.at(
                                                                        -1,
                                                                    )?.id
                                                            }
                                                        >
                                                            <ReasoningTrigger />
                                                            <ReasoningContent>
                                                                {part.text}
                                                            </ReasoningContent>
                                                        </Reasoning>
                                                    )
                                                default:
                                                    return null
                                            }
                                        })}

                                        {/* Hiển thị loading state khi agent đang xử lý */}
                                        {message.role === "assistant" &&
                                            !hasText &&
                                            toolParts.length > 0 &&
                                            status === "streaming" &&
                                            message.id ===
                                                messages.at(-1)?.id && (
                                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                    <Spinner className="size-4" />
                                                    <TextShimmer duration={1}>
                                                        Đang phân tích kết
                                                        quả...
                                                    </TextShimmer>
                                                </div>
                                            )}
                                    </MessageContent>
                                    {message.role === "user" && (
                                        <MessageAvatar
                                            src={userAvatarSrc}
                                            name={userAvatarName}
                                            className="size-8 md:size-10"
                                        />
                                    )}
                                </Message>
                            )}
                        </div>
                    )
                })}
                {status === "submitted" && (
                    <div className="flex flex-row items-center">
                        <TextShimmer className="text-base" duration={1}>
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
