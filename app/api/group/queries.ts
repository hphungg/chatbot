"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";

async function authenticate() {
    const header = await headers();
    const session = await auth.api.getSession({
        headers: header
    });
    if (!session) throw new Error("Unauthorized");
    return session.user;
}

export async function createGroupChat(title: string) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const newGroup = await prisma.group.create({
            data: {
                title,
                userId: user.id
            }
        });
        return newGroup;
    } catch (error) {
        console.error("Error creating group chat:", error);
        throw new Error("Failed to create group chat");
    }
}

export async function addChatToGroup(chatId: string, groupId: string) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const updatedChat = await prisma.chat.updateMany({
            where: {
                id: chatId,
                userId: user.id
            },
            data: {
                groupId
            }
        });
        return updatedChat;
    } catch (error) {
        console.error("Error adding chat to group:", error);
        throw new Error("Failed to add chat to group");
    }
}

export async function getGroupsByUserId() {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const groups = await prisma.group.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return groups;
    }
    catch (error) {
        console.error("Error fetching groups:", error);
        throw new Error("Failed to fetch groups");
    }
}

export async function deleteGroupById(groupId: string) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        await prisma.group.deleteMany({
            where: {
                id: groupId,
                userId: user.id
            }
        });
        await prisma.chat.updateMany({
            where: {
                groupId,
                userId: user.id
            },
            data: {
                groupId: null
            }
        });
        return true;
    } catch (error) {
        console.error("Error deleting group:", error);
        throw new Error("Failed to delete group");
    }
}

export async function renameGroup(groupId: string, newTitle: string) {
    const user = await authenticate();
    if (!user) throw new Error("Unauthorized");

    try {
        const updatedGroup = await prisma.group.updateMany({
            where: {
                id: groupId,
                userId: user.id
            },
            data: {
                title: newTitle
            }
        });
        return updatedGroup;
    } catch (error) {
        console.error("Error renaming group:", error);
        throw new Error("Failed to rename group");
    }
}
