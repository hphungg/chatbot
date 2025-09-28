import { auth } from '@/lib/auth';
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage, validateUIMessages } from 'ai';
import { headers } from 'next/headers';
import {
    deleteChatById,
    getChatById,
    getMessagesByChatId,
    saveChat,
    saveMessages
} from './queries';
import { convertToUIMessages, generateTitleFromUserMessage } from '@/lib/ai/actions';

async function authenticate() {
    const header = await headers();
    const session = await auth.api.getSession({
        headers: header
    });
    if (!session) throw new Error("Unauthorized");
    return session.user;
}

export async function POST(request: Request) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    const { chatId, message }: {
        chatId: string,
        message: UIMessage
    } = await request.json();

    const chat = await getChatById(chatId);

    if (chat) {
        if (chat.userId !== user.id) {
            return new Response("Chat not found", { status: 404 });
        }
    } else {
        const title = await generateTitleFromUserMessage({ message });
        await saveChat(chatId, title, user.id);
    }

    const prevMessages = await getMessagesByChatId(chatId);
    const messages = [...convertToUIMessages({ messages: prevMessages }), message];
    const validatedMessages = await validateUIMessages({ messages });

    const result = streamText({
        model: openai('gpt-4o'),
        messages: convertToModelMessages(validatedMessages),
    })

    return result.toUIMessageStreamResponse({
        originalMessages: validatedMessages,
        onFinish: async ({ messages }) => {
            await saveMessages(chatId, messages);
        }
    })
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