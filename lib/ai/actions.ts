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
    const { text: title } = await generateText({
        model: openai("gpt-3.5-turbo"),
        system: `\n
        - Generate a concise, 3-5 word title that captures the essence of the first message.
        - The title should clearly represent the main theme or subject of the conversation
        - Write the title in the chat's primary language; default to English if multilingual.`,
        prompt: JSON.stringify(message),
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
