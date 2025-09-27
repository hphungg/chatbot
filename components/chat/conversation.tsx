import { ChatMessage } from "@/lib/types";
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState
} from "../ai-elements/conversation";
import { MessageSquare } from "lucide-react";
import { Message, MessageContent } from "../ai-elements/message";
import { Response } from "../ai-elements/response";

interface ChatConversationProps {
    messages: ChatMessage[];
}

export function ChatConversation({

    messages,

}: ChatConversationProps) {

    return (
        <Conversation className="h-full">
            <ConversationContent>
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
            </ConversationContent>
        </Conversation>
    )
}