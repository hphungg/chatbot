import { auth } from "@/lib/auth"
import { openai } from "@ai-sdk/openai"
import {
    streamText,
    convertToModelMessages,
    UIMessage,
    createUIMessageStream,
    smoothStream,
    createUIMessageStreamResponse,
} from "ai"
import { headers } from "next/headers"
import {
    deleteChatById,
    getChatById,
    getMessagesByChatId,
    saveChat,
    saveMessages,
} from "./queries"
import { convertToUIMessages, generateTitle } from "@/lib/ai/actions"
import { generateUUID } from "@/lib/utils"

export const maxDuration = 30

async function getAuthenticatedUser() {
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })
    if (!session) throw new Error("Unauthorized")
    return session.user
}

export async function POST(request: Request) {
    const user = await getAuthenticatedUser()
    if (!user) throw new Error("Unauthorized")

    const {
        chatId,
        message,
    }: {
        chatId: string
        message: UIMessage
    } = await request.json()

    const chat = await getChatById(chatId)

    if (chat) {
        if (chat.userId !== user.id) {
            return new Response("Chat not found", { status: 404 })
        }
    } else {
        const title = await generateTitle({ message })
        await saveChat(chatId, title, user.id)
    }

    const prevMessages = await getMessagesByChatId(chatId)
    const uiMessages = [
        ...convertToUIMessages({ messages: prevMessages }),
        message,
    ]

    await saveMessages({
        messages: [
            {
                id: message.id,
                chatId: chatId,
                role: "user",
                parts: JSON.parse(JSON.stringify(message.parts)),
                attachments: [],
                createdAt: new Date(),
            },
        ],
    })

    const stream = createUIMessageStream({
        execute: ({ writer: dataStream }) => {
            const result = streamText({
                model: openai("gpt-4o"),
                messages: convertToModelMessages(uiMessages),
                experimental_transform: smoothStream({
                    delayInMs: 10,
                    chunking: "word",
                }),
            })

            result.consumeStream()

            dataStream.merge(
                result.toUIMessageStream({
                    sendReasoning: true,
                }),
            )
        },
        generateId: generateUUID,
        onFinish: async ({ messages }) => {
            await saveMessages({
                messages: messages.map((currentMessage) => ({
                    id: currentMessage.id,
                    role: currentMessage.role,
                    chatId: chatId,
                    parts: JSON.parse(JSON.stringify(currentMessage.parts)),
                    attachments: [],
                    createdAt: new Date(),
                })),
            })
        },
        onError: () => {
            return "Oops, something went wrong. Please try again."
        },
    })
    return createUIMessageStreamResponse({ stream })
}

export async function DELETE(request: Request) {
    const user = await getAuthenticatedUser()
    if (!user) throw new Error("Unauthorized")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
        return new Response("Chat ID is required", { status: 400 })
    }

    const chat = await getChatById(id)

    if (chat?.userId !== user.id) {
        return new Response("Chat not found", { status: 404 })
    }

    const deletedChat = await deleteChatById(id)

    return Response.json(deletedChat, { status: 200 })
}
