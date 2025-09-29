"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import type { Message } from "@prisma/client";
import { headers } from "next/headers";

async function authenticate() {
    const header = await headers();
    const session = await auth.api.getSession({
        headers: header
    });
    if (!session) throw new Error("Unauthorized");
    return session.user;
}

export async function getChatById(chatId: string) {
    const user = await authenticate();

    if (!user) throw new Error("Unauthorized");

    try {
        const selectedChat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                userId: user.id
            }
        });
        if (!selectedChat) return null;
        return selectedChat;
    } catch (error) {
        console.error("Error fetching chat:", error);
        throw new Error("Failed to fetch chat");
    }
}

export async function saveChat(chatId: string, title: string, userId: string, groupId?: string) {
    const user = await authenticate();

    if (!user) throw new Error("Unauthorized");

    try {
        const chat = await prisma.chat.upsert({
            where: { id: chatId },
            create: {
                id: chatId,
                title,
                userId,
                groupId
            },
            update: {
                title,
                groupId
            }
        });
        return chat;
    } catch (error) {
        console.error("Error saving chat:", error);
        throw new Error("Failed to save chat");
    }
}

export async function deleteChatById(chatId: string) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");
    try {
        await prisma.chat.deleteMany({
            where: {
                id: chatId,
                userId: user.id
            }
        });
        return true;
    } catch (error) {
        console.error("Error deleting chat:", error);
        throw new Error("Failed to delete chat");
    }
}

export async function getChatsByUserId(userId: string) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const chats = await prisma.chat.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                updatedAt: "desc"
            }
        });
        return chats;
    } catch (error) {
        console.error("Error fetching chats:", error);
        throw new Error("Failed to fetch chats");
    }
}

export async function saveMessages({ messages }: { messages: Message[] }) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const result = await prisma.message.createMany({
            data: messages.map(msg => ({
                ...msg,
                parts: msg.parts ?? {},
                attachments: msg.attachments ?? []
            })),
        });
        return result;
    } catch (error) {
        console.error("Error saving messages:", error);
        throw new Error("Failed to save messages");
    }
}

export async function getMessagesByChatId(chatId: string) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages");
    }
}