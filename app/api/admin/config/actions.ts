"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireAdminSession } from "@/app/api/admin/utils"

export interface AIConfig {
    openaiApiKey: string
    geminiApiKey: string
    deepseekApiKey: string
    model: string
}

const CONFIG_KEYS = {
    OPENAI_API_KEY: "openai_api_key",
    GEMINI_API_KEY: "gemini_api_key",
    DEEPSEEK_API_KEY: "deepseek_api_key",
    AI_MODEL: "ai_model",
} as const

export async function getAIConfig(): Promise<AIConfig> {
    await requireAdminSession()

    const configs = await prisma.config.findMany({
        where: {
            key: {
                in: [
                    CONFIG_KEYS.OPENAI_API_KEY,
                    CONFIG_KEYS.GEMINI_API_KEY,
                    CONFIG_KEYS.DEEPSEEK_API_KEY,
                    CONFIG_KEYS.AI_MODEL,
                ],
            },
        },
    })

    const configMap = new Map(configs.map((c) => [c.key, c.value]))

    return {
        openaiApiKey: configMap.get(CONFIG_KEYS.OPENAI_API_KEY) || "",
        geminiApiKey: configMap.get(CONFIG_KEYS.GEMINI_API_KEY) || "",
        deepseekApiKey: configMap.get(CONFIG_KEYS.DEEPSEEK_API_KEY) || "",
        model: configMap.get(CONFIG_KEYS.AI_MODEL) || "gpt-4o-mini",
    }
}

export async function updateAIConfig(config: AIConfig) {
    await requireAdminSession()

    if (!config.model || config.model.trim() === "") {
        throw new Error("Model không được để trống")
    }

    try {
        const upsertOperations = [
            prisma.config.upsert({
                where: { key: CONFIG_KEYS.OPENAI_API_KEY },
                update: { value: config.openaiApiKey.trim() },
                create: {
                    key: CONFIG_KEYS.OPENAI_API_KEY,
                    value: config.openaiApiKey.trim(),
                },
            }),
            prisma.config.upsert({
                where: { key: CONFIG_KEYS.GEMINI_API_KEY },
                update: { value: config.geminiApiKey.trim() },
                create: {
                    key: CONFIG_KEYS.GEMINI_API_KEY,
                    value: config.geminiApiKey.trim(),
                },
            }),
            prisma.config.upsert({
                where: { key: CONFIG_KEYS.DEEPSEEK_API_KEY },
                update: { value: config.deepseekApiKey.trim() },
                create: {
                    key: CONFIG_KEYS.DEEPSEEK_API_KEY,
                    value: config.deepseekApiKey.trim(),
                },
            }),
            prisma.config.upsert({
                where: { key: CONFIG_KEYS.AI_MODEL },
                update: { value: config.model },
                create: {
                    key: CONFIG_KEYS.AI_MODEL,
                    value: config.model,
                },
            }),
        ]

        await prisma.$transaction(upsertOperations)

        revalidatePath("/admin/config")
        revalidatePath("/admin")

        return { success: true }
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Không thể cập nhật cấu hình AI")
    }
}
