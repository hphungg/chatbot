import { auth } from "@/lib/auth"
import { createOpenAI, openai } from "@ai-sdk/openai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import {
    streamText,
    convertToModelMessages,
    UIMessage,
    smoothStream,
    consumeStream,
} from "ai"
import { headers } from "next/headers"
import { deleteChatById, getChatById, saveChat, saveMessages } from "./queries"
import { generateTitle } from "@/lib/ai/actions"
import { generateUUID } from "@/lib/utils"
import {
    employeeTools,
    departmentTools,
    projectTools,
    emailTools,
    calendarTools,
} from "@/lib/ai/tools"
import { system_prompt } from "@/lib/ai/prompt"
import { prisma } from "@/lib/db/prisma"

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
        groupId,
        model,
    }: {
        chatId: string
        messages: UIMessage[]
        groupId?: string
        model?: string
    } = await request.json()

    const chat = await getChatById(chatId)

    if (chat) {
        if (chat.userId !== user.id) {
            return new Response("Chat not found", { status: 404 })
        }
    } else {
        const message = messages.at(-1)
        const title = await generateTitle({ message })
        await saveChat(chatId, title, user.id, groupId)
    }

    const configs = await prisma.config.findMany({
        where: {
            key: {
                in: ["openai_api_key", "gemini_api_key", "deepseek_api_key"],
            },
        },
    })

    const configMap = new Map(configs.map((c: any) => [c.key, c.value]))
    const openaiApiKey = configMap.get("openai_api_key") || ""
    const geminiApiKey = configMap.get("gemini_api_key") || ""
    const deepseekApiKey = configMap.get("deepseek_api_key") || ""

    const selectedModel = model || "gpt-4o-mini"

    let modelInstance
    if (selectedModel.startsWith("gpt-") && openaiApiKey) {
        const openaiProvider = createOpenAI({
            apiKey: openaiApiKey as string,
        })
        modelInstance = openaiProvider(selectedModel)
    } else if (selectedModel.startsWith("gemini-") && geminiApiKey) {
        const geminiProvider = createGoogleGenerativeAI({
            apiKey: geminiApiKey as string,
        })
        modelInstance = geminiProvider(selectedModel)
    } else if (selectedModel.startsWith("deepseek-") && deepseekApiKey) {
        const deepseekProvider = createDeepSeek({
            apiKey: deepseekApiKey as string,
        })
        modelInstance = deepseekProvider(selectedModel)
    } else {
        modelInstance = openai("gpt-4o-mini")
    }

    const result = streamText({
        model: modelInstance,
        system: system_prompt,
        messages: convertToModelMessages(messages),
        tools: {
            ...employeeTools,
            ...departmentTools,
            ...projectTools,
            ...emailTools,
            ...calendarTools,
        },
        abortSignal: request.signal,
        experimental_transform: smoothStream({
            chunking: "word",
            delayInMs: 10,
        }),
    })

    return result.toUIMessageStreamResponse({
        sendReasoning: true,
        sendSources: true,
        originalMessages: messages,
        onFinish: async ({ messages: finishedMessages, isAborted }) => {
            if (isAborted) {
                console.log("Stream was aborted by user")
            }

            saveMessages({
                messages: finishedMessages.slice(-2).map((msg) => ({
                    id: msg.id === "" ? generateUUID() : msg.id,
                    role: msg.role,
                    chatId: chatId,
                    parts: JSON.parse(JSON.stringify(msg.parts)),
                    attachments: [],
                    createdAt: new Date(),
                })),
            })
        },
        consumeSseStream: consumeStream,
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
