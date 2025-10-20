"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireAdminSession } from "@/app/api/admin/utils"

export interface AIConfig {
    apiKey: string
    model: string
}

const CONFIG_KEYS = {
    AI_API_KEY: "ai_api_key",
    AI_MODEL: "ai_model",
} as const

export async function getAIConfig(): Promise<AIConfig> {
    await requireAdminSession()

    const configs = await prisma.config.findMany({
        where: {
            key: {
                in: [CONFIG_KEYS.AI_API_KEY, CONFIG_KEYS.AI_MODEL],
            },
        },
    })

    const configMap = new Map(configs.map((c) => [c.key, c.value]))

    return {
        apiKey: configMap.get(CONFIG_KEYS.AI_API_KEY) || "",
        model: configMap.get(CONFIG_KEYS.AI_MODEL) || "gpt-4o-mini",
    }
}

export async function updateAIConfig(config: AIConfig) {
    await requireAdminSession()

    if (!config.apiKey || config.apiKey.trim() === "") {
        throw new Error("API Key không được để trống")
    }

    if (!config.model || config.model.trim() === "") {
        throw new Error("Model không được để trống")
    }

    try {
        await prisma.$transaction([
            prisma.config.upsert({
                where: { key: CONFIG_KEYS.AI_API_KEY },
                update: { value: config.apiKey.trim() },
                create: {
                    key: CONFIG_KEYS.AI_API_KEY,
                    value: config.apiKey.trim(),
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
        ])

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
