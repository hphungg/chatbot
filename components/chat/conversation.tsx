import { UIMessage } from "ai";
import { UseChatHelpers } from "@ai-sdk/react";
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState
} from "@/components/ai-elements/conversation";
import { MessageSquare } from "lucide-react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";

interface ChatConversationProps {
    messages: UIMessage[];
    status: UseChatHelpers<UIMessage>["status"];
}

export function ChatConversation({
    messages,
    status
}: ChatConversationProps) {

    return (
        <Conversation className="h-full">
            <ConversationContent className={messages.length === 0 ? "flex items-center justify-center h-full" : ""}>
                {messages.length === 0 && (
                    <ConversationEmptyState
                        title="No messages yet"
                        description="Send a message to start the conversation."
                        icon={<MessageSquare className="size-12" />}
                    />
                )}
                {messages.map((message, index) => (
                    <div key={message.id}>
                        <Message from={message.role}>
                            <MessageContent>
                                {
                                    message.parts.map((part, i) => {
                                        if (part.type === "text") {
                                            return (
                                                <Response key={`${message.id}-${i}`}>
                                                    {part.text}
                                                </Response>
                                            )
                                        }
                                    })
                                }
                            </MessageContent>
                        </Message>
                    </div>
                ))}
                {status === 'submitted' && <Loader />}
            </ConversationContent>
        </Conversation>
    )
}