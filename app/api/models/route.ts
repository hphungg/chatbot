import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export const AI_MODELS = [
    { value: "gpt-4.1", label: "GPT-4.1", provider: "openai" },
    { value: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai" },
    { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
    {
        value: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        provider: "google",
    },
    {
        value: "gemini-2.5-flash-lite",
        label: "Gemini 2.5 Flash Lite",
        provider: "google",
    },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "google" },
    { value: "deepseek-chat", label: "DeepSeek Chat", provider: "deepseek" },
] as const

export async function GET() {
    // Fetch the default model from the database config
    const modelConfig = await prisma.config.findUnique({
        where: { key: "ai_model" },
    })

    const defaultModel = modelConfig?.value || "gpt-4o-mini"

    return NextResponse.json({
        models: AI_MODELS,
        defaultModel,
    })
}
