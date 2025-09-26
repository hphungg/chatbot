import type { UseChatHelpers } from "@ai-sdk/react";
import { ChatMessage } from "@/lib/types";
import { useMessages } from "@/hooks/use-messages";
import { useDataStream } from "../../context/data-stream-provider";
import { memo, useEffect } from "react";
import { Conversation, ConversationContent } from "../ai-elements/conversation";
import { ArrowDown } from "lucide-react";
import equal from "fast-deep-equal";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type ChatConversationProps = {
    chatId: string;
    status: UseChatHelpers<ChatMessage>["status"];
    messages: ChatMessage[];
    setMessages: UseChatHelpers<ChatMessage>["setMessages"];
    regenerate: UseChatHelpers<ChatMessage>["regenerate"];
    isArtifactVisible: boolean;
    selectedModelId: string;
}

function PureChatConversation({
    chatId,
    status,
    messages,
    setMessages,
    regenerate,
    isArtifactVisible,
    selectedModelId,
}: ChatConversationProps) {
    const {
        containerRef: messagesContainerRef,
        endRef: messagesEndRef,
        isAtBottom,
        scrollToBottom,
        hasSentMessage,
    } = useMessages({
        status,
    });

    useDataStream();

    useEffect(() => {
        if (status === "submitted") {
            requestAnimationFrame(() => {
                const container = messagesContainerRef.current;
                if (container) {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: "smooth",
                    });
                }
            });
        }
    }, [status, messagesContainerRef]);

    return (
        <div
            className="overscroll-behavior-contain -webkit-overflow-scrolling-touch flex-1 touch-pan-y overflow-y-scroll"
            ref={messagesContainerRef}
            style={{ overflowAnchor: "none" }}
        >
            <Conversation className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 md:gap-6">
                <ConversationContent className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
                    {messages.length === 0 && <Greeting />}

                    {messages.map((message, index) => (
                        <PreviewMessage
                            chatId={chatId}
                            isLoading={
                                status === "streaming" && messages.length - 1 === index
                            }
                            key={message.id}
                            message={message}
                            regenerate={regenerate}
                            requiresScrollPadding={
                                hasSentMessage && index === messages.length - 1
                            }
                            setMessages={setMessages}
                        />
                    ))}

                    {
                        status === "submitted" &&
                        messages.length > 0 &&
                        messages.at(-1)?.role === "user" &&
                        selectedModelId !== "chat-model-reasoning" && <ThinkingMessage />
                    }

                    <div
                        className="min-h-[24px] min-w-[24px] shrink-0"
                        ref={messagesEndRef}
                    />
                </ConversationContent>
            </Conversation>

            {
                !isAtBottom && (
                    <button
                        aria-label="Scroll to bottom"
                        className="-translate-x-1/2 absolute bottom-40 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-colors hover:bg-muted"
                        onClick={() => scrollToBottom("smooth")}
                        type="button"
                    >
                        <ArrowDown className="size-4" />
                    </button>
                )
            }
        </div>
    );
}

export const ChatConversation = memo(PureChatConversation, (prevProps, nextProps) => {
    if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
        return true;
    }

    if (prevProps.status !== nextProps.status) {
        return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
        return false;
    }
    if (prevProps.messages.length !== nextProps.messages.length) {
        return false;
    }
    if (!equal(prevProps.messages, nextProps.messages)) {
        return false;
    }

    return false;
});