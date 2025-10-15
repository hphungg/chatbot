"use client"

import {
    Dispatch,
    SetStateAction,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react"
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
import { FileIcon, ImageIcon, PlusIcon } from "lucide-react"

interface ChatInputProps {
    chatId?: string
    input: string
    setInput: Dispatch<SetStateAction<string>>
    sendMessage: UseChatHelpers<UIMessage>["sendMessage"]
    status: UseChatHelpers<UIMessage>["status"]
}

const formatFileSize = (size: number): string => {
    if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
    if (size >= 1024) {
        return `${Math.round(size / 1024)} KB`
    }
    return `${size} B`
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
    const selectedFiles = useMemo(
        () => (files ? Array.from(files) : []),
        [files],
    )

    const handleSubmit = useCallback(() => {
        const hasMessage = input.trim().length > 0
        const hasFiles = Boolean(files && files.length > 0)

        if (!hasMessage && !hasFiles) {
            return
        }

        window.history.replaceState({}, "", `/chat/${chatId}`)

        sendMessage({
            text: input,
            files: files,
        })
        setInput("")
        setFiles(undefined)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }

        if (width && width > 768) {
            textareaRef.current?.focus()
        }
    }, [chatId, files, input, sendMessage, setInput, width])

    return (
        <PromptInput
            onSubmit={handleSubmit}
            className="max-w-3xl border-2 shadow-md"
        >
            <PromptInputBody className="gap-2">
                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 px-6 pt-4">
                        {selectedFiles.map((file) => (
                            <div
                                key={`${file.name}-${file.lastModified}`}
                                className="flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                            >
                                {file.type.startsWith("image/") ? (
                                    <ImageIcon className="size-4 shrink-0" />
                                ) : (
                                    <FileIcon className="size-4 shrink-0" />
                                )}
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate font-medium">
                                        {file.name}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {formatFileSize(file.size)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <PromptInputTextarea
                    autoFocus
                    ref={textareaRef}
                    rows={2}
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    placeholder="Hỏi một câu nào đó..."
                    className="px-6 py-4 !text-lg !leading-relaxed"
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
