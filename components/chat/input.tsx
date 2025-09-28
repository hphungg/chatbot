"use client"

import { Dispatch, SetStateAction, useCallback, useRef } from "react";
import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputAttachment,
    PromptInputAttachments,
    PromptInputBody,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools
} from "../ai-elements/prompt-input";
import { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import { Attachment } from "@/lib/types";
import { useWindowSize } from "usehooks-ts";
import { Button } from "../ui/button";
import { StopIcon } from "@radix-ui/react-icons";

interface ChatInputProps {
    chatId?: string;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    attachments: Attachment[];
    stop: () => void;
    setAttachments: Dispatch<SetStateAction<Attachment[]>>;
    messages: UIMessage[];
    sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
    setMessages: UseChatHelpers<UIMessage>["setMessages"];
    status: UseChatHelpers<UIMessage>["status"];
}

export function ChatInput({
    chatId,
    input,
    setInput,
    status,
    attachments,
    stop,
    setAttachments,
    messages,
    sendMessage,
    setMessages
}: ChatInputProps) {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { width } = useWindowSize();

    const handleSubmit = useCallback(() => {
        window.history.replaceState({}, "", `/chat/${chatId}`);

        sendMessage({
            role: "user",
            parts: [
                ...attachments.map((attachment) => ({
                    type: "file" as const,
                    url: attachment.url,
                    name: attachment.name,
                    mediaType: attachment.contentType,
                })),
                {
                    type: "text",
                    text: input
                }
            ]
        });
        setInput("");
        setAttachments([]);

        if (width && width > 768) {
            textareaRef.current?.focus();
        }
    }, [chatId, input, setInput, sendMessage, attachments, setAttachments, width]);

    const handleStop = () => {
        stop();
        setMessages((messages) => messages);
    }

    return (
        <PromptInput
            onSubmit={handleSubmit}
            className="mt-4"
            globalDrop
            multiple
        >
            <PromptInputBody>
                <PromptInputAttachments>
                    {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea
                    autoFocus
                    ref={textareaRef}
                    rows={2}
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    placeholder="Ask a question or type a command..."
                />
            </PromptInputBody>
            <PromptInputToolbar>
                <PromptInputTools>
                    <PromptInputActionMenu>
                        <PromptInputActionMenuTrigger />
                        <PromptInputActionMenuContent>
                            <PromptInputActionAddAttachments
                                label="Add Documents"
                            />
                        </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                </PromptInputTools>
                {
                    status === "submitted" ? (
                        <Button
                            className="size-7 rounded-full bg-foreground p-1 text-background transition-colors duration-200 hover:bg-foreground/80 disabled:bg-muted disabled:text-muted-foreground"
                            onClick={handleStop}
                        >
                            <StopIcon className="size-4" />
                        </Button>
                    ) : (
                        <PromptInputSubmit disabled={!input && !status} status={status}/>
                    )
                }
            </PromptInputToolbar>
        </PromptInput>
    )
}
