import { prisma } from "../db/prisma"

const CONFIG_KEYS = {
    AI_API_KEY: "ai_api_key",
    AI_MODEL: "ai_model",
} as const

export async function getAIConfigPublic() {
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
