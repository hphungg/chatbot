"use client";

import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Attachment, ChatMessage } from "@/lib/types";
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger, PromptInputAttachment, PromptInputAttachments, PromptInputBody, PromptInputButton, PromptInputMessage, PromptInputModelSelect, PromptInputModelSelectContent, PromptInputModelSelectItem, PromptInputModelSelectTrigger, PromptInputModelSelectValue, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from "../ai-elements/prompt-input";
import { chatModels } from "@/lib/ai/models";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

function PureChatInput({
    chatId,
    input,
    setInput,
    status,
    stop,
    attachments,
    setAttachments,
    messages,
    setMessages,
    sendMessage,
    className,
    selectedModelId,
    onModelChange,
}: {
    chatId: string;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    status: UseChatHelpers<ChatMessage>["status"];
    stop: () => void;
    attachments: Attachment[];
    setAttachments: Dispatch<SetStateAction<Attachment[]>>;
    messages: UIMessage[];
    setMessages: UseChatHelpers<ChatMessage>["setMessages"];
    sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
    className?: string;
    selectedModelId: string;
    onModelChange: (modelId: string) => void;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "44px";
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight();
        }
    }, [adjustHeight]);

    const resetHeight = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "44px";
        }
    }, []);

    const [localStorageInput, setLocalStorageInput] = useLocalStorage(
        "input",
        ""
    );

    useEffect(() => {
        if (textareaRef.current) {
            const domValue = textareaRef.current.value;
            const finalValue = domValue || localStorageInput || "";
            setInput(finalValue);
            adjustHeight();
        }
    }, [localStorageInput, setInput, adjustHeight]);

    useEffect(() => {
        setLocalStorageInput(input);
    }, [input, setLocalStorageInput]);

    const handleSubmit = (messages: PromptInputMessage) => {
        const hasInput = Boolean(messages.text);
        const hasAttachments = Boolean(messages.files?.length);

        if (!hasInput && !hasAttachments) {
            return;
        }

        toast.success(messages.text);
        setInput("");
    }

    return (
        <div className={cn("relative flex w-full flex-col gap-4", className)}>
            <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
                <PromptInputBody>
                    <PromptInputAttachments>
                        {(attachment) => <PromptInputAttachment data={attachment} />}
                    </PromptInputAttachments>
                    <PromptInputTextarea
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                    />
                </PromptInputBody>

                <PromptInputToolbar>
                    <PromptInputTools>
                        <PromptInputActionMenu>
                            <PromptInputActionMenuTrigger />
                            <PromptInputActionMenuContent>
                                <PromptInputActionAddAttachments />
                            </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
                        <PromptInputModelSelect
                            onValueChange={(value) => {
                               const model = chatModels.find((m) => m.id === value);
                                if (model) {
                                    onModelChange?.(model.id);
                                }
                            }}
                            value={selectedModelId}
                        >
                            <PromptInputModelSelectTrigger>
                                <PromptInputModelSelectValue />
                            </PromptInputModelSelectTrigger>
                            <PromptInputModelSelectContent>
                                {chatModels.map((model) => (
                                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                                    {model.name}
                                    </PromptInputModelSelectItem>
                                ))}
                            </PromptInputModelSelectContent>
                        </PromptInputModelSelect>
                    </PromptInputTools>

                    <PromptInputSubmit disabled={!input && !status} status={status} />
                </PromptInputToolbar>
            </PromptInput>
        </div>
    )
}

export const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) {
      return false;
    }
    if (prevProps.status !== nextProps.status) {
      return false;
    }
    if (!equal(prevProps.attachments, nextProps.attachments)) {
      return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }

    return true;
});