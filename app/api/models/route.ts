import { NextResponse } from "next/server"

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
    return NextResponse.json({
        models: AI_MODELS,
        defaultModel: "gpt-4o-mini",
    })
}
