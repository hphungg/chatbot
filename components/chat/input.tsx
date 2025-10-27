"use client"

import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import {
    PromptInput,
    PromptInputBody,
    PromptInputButton,
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from "../ai-elements/prompt-input"
import { UIMessage, UseChatHelpers } from "@ai-sdk/react"
import { useWindowSize } from "usehooks-ts"
import { FileIcon, ImageIcon, PlusIcon } from "lucide-react"

interface ChatInputProps {
    input: string
    setInput: Dispatch<SetStateAction<string>>
    sendMessage: UseChatHelpers<UIMessage>["sendMessage"]
    status: UseChatHelpers<UIMessage>["status"]
    stop: UseChatHelpers<UIMessage>["stop"]
    selectedModel: string
    onModelChange: (model: string) => void
}

interface AIModel {
    value: string
    label: string
    provider: string
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
    input,
    setInput,
    status,
    sendMessage,
    stop,
    selectedModel,
    onModelChange,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { width } = useWindowSize()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<FileList | undefined>(undefined)
    const [models, setModels] = useState<AIModel[]>([])
    const selectedFiles = useMemo(
        () => (files ? Array.from(files) : []),
        [files],
    )

    useEffect(() => {
        fetch("/api/models")
            .then((res) => res.json())
            .then((data) => {
                setModels(data.models || [])
            })
            .catch((error) => {
                console.error("Failed to fetch models:", error)
            })
    }, [])

    const handleSubmit = useCallback(() => {
        if (status === "submitted" || status === "streaming") {
            return
        }

        const hasMessage = input.trim().length > 0
        const hasFiles = Boolean(files && files.length > 0)

        if (!hasMessage && !hasFiles) {
            return
        }

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
    }, [files, input, sendMessage, setInput, width, status])

    const handleStop = useCallback(() => {
        stop()
    }, [stop])

    const placeholder =
        status === "submitted" || status === "streaming"
            ? "Chatbot đang trả lời..."
            : "Hỏi một câu nào đó..."

    return (
        <PromptInput onSubmit={handleSubmit} className="max-w-3xl">
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
                    placeholder={placeholder}
                    className="px-6 py-4 !text-base !leading-relaxed"
                    disabled={status === "submitted" || status === "streaming"}
                />
            </PromptInputBody>
            <PromptInputToolbar>
                <PromptInputTools>
                    <PromptInputButton
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Thêm tệp đính kèm"
                        disabled={
                            status === "submitted" || status === "streaming"
                        }
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
                        disabled={
                            status === "submitted" || status === "streaming"
                        }
                    />

                    {models.length > 0 && (
                        <PromptInputModelSelect
                            value={selectedModel}
                            onValueChange={onModelChange}
                            disabled={
                                status === "submitted" || status === "streaming"
                            }
                        >
                            <PromptInputModelSelectTrigger>
                                <PromptInputModelSelectValue />
                            </PromptInputModelSelectTrigger>
                            <PromptInputModelSelectContent>
                                {models.map((model) => (
                                    <PromptInputModelSelectItem
                                        key={model.value}
                                        value={model.value}
                                    >
                                        {model.label}
                                    </PromptInputModelSelectItem>
                                ))}
                            </PromptInputModelSelectContent>
                        </PromptInputModelSelect>
                    )}
                </PromptInputTools>

                <PromptInputSubmit
                    disabled={
                        status === "submitted" ||
                        (status === "ready" && !input.trim() && !files?.length)
                    }
                    status={status}
                    onStop={handleStop}
                />
            </PromptInputToolbar>
        </PromptInput>
    )
}
