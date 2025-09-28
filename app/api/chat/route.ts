import { auth } from '@/lib/auth';
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, createUIMessageStream, JsonToSseTransformStream } from 'ai';
import { headers } from 'next/headers';
import { PostRequestBody, postRequestBodySchema } from './schema';
import { ChatMessage } from '@/lib/types';
import { deleteChatById, getChatById, getMessagesByChatId, saveChat, saveMessages } from './queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '@/lib/ai/actions';

export const maxDuration = 30;

async function authenticate() {
    const header = await headers();
    const session = await auth.api.getSession({
        headers: header
    });
    if (!session) throw new Error("Unauthorized");
    return session.user;
}

export async function POST(request: Request) {
    let requestBody: PostRequestBody;

    try {
        const json = await request.json();
        requestBody = postRequestBodySchema.parse(json);
    } catch (error) {
        return new Response("Invalid request body", { status: 400 });
    }

    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const {
            id,
            message
        }: {
            id: string;
            message: ChatMessage;
        } = requestBody;

        const chat = await getChatById(id);

        if (chat) {
            if (chat.userId !== user.id) {
                return new Response("Chat not found", { status: 404 });
            }
        } else {
            const title = await generateTitleFromUserMessage({ message });
            await saveChat(id, title, user.id);
        }

        const messagesFromDatabase = await getMessagesByChatId(id);
        const uiMessage = [...convertToUIMessages(messagesFromDatabase), message];

        await saveMessages({
            messages: [
                {
                    id: message.id,
                    chatId: id,
                    role: "user",
                    parts: JSON.parse(JSON.stringify(message.parts || {})),
                    attachments: [],
                    createdAt: new Date(),
                },
            ],
        });

        const stream = createUIMessageStream({
            execute: ({ writer: dataStream }) => {
                const result = streamText({
                    model: openai('gpt-4o'),
                    messages: convertToModelMessages(uiMessage),

                });

                result.consumeStream();

                dataStream.merge(
                    result.toUIMessageStream({
                        sendReasoning: true,
                    })
                )
            },
            generateId: generateUUID,
            onFinish: async ({ messages }) => {
                await saveMessages({
                    messages: messages.map((message) => ({
                        id: message.id,
                        chatId: id,
                        role: message.role,
                        parts: JSON.parse(JSON.stringify(message.parts || {})),
                        attachments: [],
                        createdAt: new Date(),
                    }))
                })
            },
            onError: () => {
                return "Oops, something went wrong. Please try again.";
            },
        });

        return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    } catch (error) {
        console.error("Error processing chat request:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return new Response("Chat ID is required", { status: 400 });
    }

    const chat = await getChatById(id);

    if (chat?.userId !== user.id) {
        return new Response("Chat not found", { status: 404 });
    }

    const deletedChat = await deleteChatById(id);

    return Response.json(deletedChat, { status: 200 });
}