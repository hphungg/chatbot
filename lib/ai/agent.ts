import { Experimental_Agent as Agent } from "ai"
import { system_prompt } from "./prompt"
import { dbTools } from "./tools"
import { createOpenAI } from "@ai-sdk/openai"
import { getAIConfigPublic } from "./config"

async function createChatbot() {
    const aiConfig = await getAIConfigPublic()

    if (!aiConfig.apiKey) {
        throw new Error("API key not found in config")
    }

    const openai = createOpenAI({
        apiKey: aiConfig.apiKey,
    })

    return new Agent({
        model: aiConfig.model,
        system: system_prompt,
        tools: dbTools,
    })
}

export const Chatbot = createChatbot()
