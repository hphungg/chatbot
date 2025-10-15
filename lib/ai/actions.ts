import { openai } from "@ai-sdk/openai"
import { Message } from "@prisma/client"
import { generateText, UIDataTypes, UIMessage, UIMessagePart } from "ai"
import { formatISO } from "date-fns"

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

    const { text: title } = await generateText({
        model: openai("gpt-3.5-turbo"),
        system: `Tạo một tiêu đề ngắn gọn, khoảng 3-5 từ, truyền tải được nội dung cốt lõi của tin nhắn của người dùng. Tiêu đề phải thể hiện rõ chủ đề của cuộc trò chuyện. Viết tiêu đề bằng ngôn ngữ chính của cuộc trò chuyện; mặc định là tiếng Việt nếu không thể xác định.`,
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
