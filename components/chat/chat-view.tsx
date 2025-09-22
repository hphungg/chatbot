"use client";

import { Attachment, ChatMessage } from "@/lib/types";
import { ChatHeader } from "./chat-header";
import { ChatConversation } from "./chat-conversation";
import { useChat } from "@ai-sdk/react";
import { fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { useDataStream } from "../providers/data-stream-provider";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { ChatInput } from "./chat-input";


export function Chat({
    id,
    initialMessages,
    initialModel,
    autoResume,
}: {
    id: string;
    initialMessages?: ChatMessage[];
    initialModel: string;
    autoResume?: boolean;
}) {
    const [currentModelId, setCurrentModelId] = useState(initialModel);
    const [input, setInput] = useState<string>("");
    const currentModelIdRef = useRef(currentModelId);

    useEffect(() => {
        currentModelIdRef.current = currentModelId;
    }, [currentModelId]);

    const { mutate } = useSWRConfig();
    const { setDataStream } = useDataStream();

    const {
        messages,
        setMessages,
        sendMessage,
        status,
        stop,
        regenerate,
        resumeStream,
    } = useChat<ChatMessage>({
        id,
        messages: initialMessages,
        experimental_throttle: 100,
        generateId: generateUUID,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            fetch: fetchWithErrorHandlers,
            prepareSendMessagesRequest(request) {
                return {
                    body: {
                        id: request.id,
                        message: request.messages.at(-1),
                        selectedChatModel: currentModelIdRef.current,
                        ...request.body,
                    }
                }
            }
        }),
        onData: (dataPart) => {
            setDataStream((ds) => (ds ? [...ds, dataPart] : []));
        },
        onFinish: () => {
            // mutate(unstable_serialize(getChatHistoryPaginationKey))
        }
    })

    const isArtifactVisible = true;

    const [attachments, setAttachments] = useState<Attachment[]>([]);

    return (
        <>
            <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
                <ChatHeader chatId={id} />

                <ChatConversation
                    chatId={id}
                    messages={messages}
                    regenerate={regenerate}
                    selectedModelId={initialModel}
                    isArtifactVisible={isArtifactVisible}
                    setMessages={setMessages}
                    status={status}
                />

                <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
                    <ChatInput
                        attachments={attachments}
                        chatId={id}
                        input={input}
                        messages={messages}
                        onModelChange={setCurrentModelId}
                        selectedModelId={currentModelId}
                        sendMessage={sendMessage}
                        setAttachments={setAttachments}
                        setInput={setInput}
                        setMessages={setMessages}
                        status={status}
                        stop={stop}
                    />
                </div>

            </div>
        </>
    )
}