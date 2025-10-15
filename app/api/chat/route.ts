import { auth } from "@/lib/auth"
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, UIMessage, smoothStream } from "ai"
import { headers } from "next/headers"
import { deleteChatById, getChatById, saveChat, saveMessages } from "./queries"
import { generateTitle } from "@/lib/ai/actions"
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
        messages,
    }: {
        chatId: string
        messages: UIMessage[]
    } = await request.json()

    const chat = await getChatById(chatId)

    if (chat) {
        if (chat.userId !== user.id) {
            return new Response("Chat not found", { status: 404 })
        }
    } else {
        const message = messages.at(-1)
        const title = await generateTitle({ message })
        await saveChat(chatId, title, user.id)
    }

    const result = streamText({
        model: openai("gpt-4.1"),
        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({
            chunking: "word",
            delayInMs: 10,
        }),
    })

    return result.toUIMessageStreamResponse({
        sendReasoning: true,
        originalMessages: messages,
        onFinish: ({ messages }) => {
            saveMessages({
                messages: messages.slice(-2).map((msg) => ({
                    id: msg.id === "" ? generateUUID() : msg.id,
                    role: msg.role,
                    chatId: chatId,
                    parts: JSON.parse(JSON.stringify(msg.parts)),
                    attachments: [],
                    createdAt: new Date(),
                })),
            })
        },
    })
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
