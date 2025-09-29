import { openai } from "@ai-sdk/openai";
import { Message } from "@prisma/client";
import { generateText, UIDataTypes, UIMessage, UIMessagePart } from "ai";
import { formatISO } from "date-fns";

export async function generateTitleFromUserMessage({
    message,
}: {
    message: UIMessage
}) {
    const { text: title } = await generateText({
        model: openai("gpt-3.5-turbo"),
        system: `\n
        - You will generate a short title based on the first message a user begins a conversation with
        - ensure it is not more than 80 characters long
        - the title should be a summary of the user's message
        - do not use quotes or colons
        - the title must be in the same language as the user's message`,
        prompt: JSON.stringify(message),
    });

    return title;
}

export function convertToUIMessages({
    messages,
}: {
    messages: Message[]
}): UIMessage[] {
    return messages.map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        parts: message.parts as UIMessagePart<UIDataTypes, {}>[],
        metadata: {
            createdAt: formatISO(message.createdAt),
        }
    }));
}