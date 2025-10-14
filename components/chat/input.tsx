"use client"

import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react"
import {
    PromptInput,
    PromptInputBody,
    PromptInputButton,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from "../ai-elements/prompt-input"
import { UIMessage, UseChatHelpers } from "@ai-sdk/react"
import { useWindowSize } from "usehooks-ts"
import { PlusIcon } from "lucide-react"

interface ChatInputProps {
    chatId?: string
    input: string
    setInput: Dispatch<SetStateAction<string>>
    sendMessage: UseChatHelpers<UIMessage>["sendMessage"]
    status: UseChatHelpers<UIMessage>["status"]
}

export function ChatInput({
    chatId,
    input,
    setInput,
    status,
    sendMessage,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { width } = useWindowSize()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<FileList | undefined>(undefined)

    const handleSubmit = useCallback(() => {
        window.history.replaceState({}, "", `/chat/${chatId}`)

        sendMessage({
            text: input,
            files: files,
        })
        setInput("")
        setFiles(undefined)

        if (width && width > 768) {
            textareaRef.current?.focus()
        }
    }, [chatId, input, setInput, sendMessage, width])

    return (
        <PromptInput
            onSubmit={handleSubmit}
            globalDrop
            multiple
            className="max-w-3xl shadow-md"
        >
            <PromptInputBody>
                <PromptInputTextarea
                    autoFocus
                    ref={textareaRef}
                    rows={2}
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    placeholder="Hỏi một câu nào đó..."
                    className="p-4 !text-[16px] !leading-relaxed"
                />
            </PromptInputBody>
            <PromptInputToolbar>
                <PromptInputTools>
                    <PromptInputButton
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Thêm tệp đính kèm"
                    >
                        <PlusIcon />
                    </PromptInputButton>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) {
                                setFiles(e.target.files)
                            }
                        }}
                        multiple
                        accept="application/pdf, image/*"
                    />
                </PromptInputTools>

                <PromptInputSubmit
                    disabled={!input && !status}
                    status={status}
                />
            </PromptInputToolbar>
        </PromptInput>
    )
}
