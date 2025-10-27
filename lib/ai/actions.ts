import { createOpenAI } from "@ai-sdk/openai"
import { Message } from "@prisma/client"
import { generateText, UIDataTypes, UIMessage, UIMessagePart } from "ai"
import { formatISO } from "date-fns"
import { getAIConfigPublic } from "./config"

export async function generateTitle({
    message,
}: {
    message: UIMessage | undefined
}) {
    if (!message) return "Cuộc trò chuyện mới"

    const textPart = (message.parts as UIMessagePart<UIDataTypes, {}>[]).filter(
        (p: any) => p?.type === "text" && typeof (p as any).text === "string",
    )

    let prompt = textPart
        .map((p: any) => (p as any).text)
        .join("\n\n")
        .trim()

    if (!prompt) {
        const fileNames = (message.parts as UIMessagePart<UIDataTypes, {}>[])
            .map((p: any) => p?.filename ?? p?.name)
            .filter(Boolean)
        if (fileNames.length) {
            prompt = `Người dùng gửi tệp đính kèm: ${fileNames.join(", ")}`
        } else {
            prompt = "Người dùng gửi một tin nhắn"
        }
    }

    prompt = prompt.slice(0, 2000) // Limit to 2000 characters

    const aiConfig = await getAIConfigPublic()
    const openaiProvider = createOpenAI({
        apiKey: aiConfig.apiKey,
    })

    const { text: title } = await generateText({
        model: openaiProvider("gpt-3.5-turbo"), // Keep gpt-3.5-turbo for title generation as it's cheaper
        system: `Tạo một bảm tóm tắt ngắn gọn (tối đa 5 từ) cho nội dung sau, sử dụng ngôn ngữ gốc của nội dung đó. Không sử dụng dấu câu hoặc các ký tự đặc biệt.`,
        prompt,
    })

    return title
}

export function convertToUIMessages({
    messages,
}: {
    messages: Message[]
}): UIMessage[] {
    return messages.map((message) => ({
        id: message.id,
        role: message.role as "user" | "assistant" | "system",
        parts: message.parts as UIMessagePart<UIDataTypes, {}>[],
        metadata: {
            createdAt: formatISO(message.createdAt),
        },
    }))
}
