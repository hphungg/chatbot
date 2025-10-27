"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateAIConfig, type AIConfig } from "@/app/api/admin/config/actions"
import { toast } from "sonner"
import { Eye, EyeOff, Save } from "lucide-react"

const AI_MODELS = [
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4o-mini", label: "GPT-4o mini" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "deepseek-chat", label: "DeepSeek Chat" },
] as const

interface ConfigFormProps {
    initialConfig: AIConfig
}

export function ConfigForm({ initialConfig }: ConfigFormProps) {
    const [openaiApiKey, setOpenaiApiKey] = useState(initialConfig.openaiApiKey)
    const [geminiApiKey, setGeminiApiKey] = useState(initialConfig.geminiApiKey)
    const [deepseekApiKey, setDeepseekApiKey] = useState(
        initialConfig.deepseekApiKey,
    )
    const [model, setModel] = useState(initialConfig.model)
    const [showOpenaiApiKey, setShowOpenaiApiKey] = useState(false)
    const [showGeminiApiKey, setShowGeminiApiKey] = useState(false)
    const [showDeepseekApiKey, setShowDeepseekApiKey] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            await updateAIConfig({
                openaiApiKey,
                geminiApiKey,
                deepseekApiKey,
                model,
            })
            toast.success("Cấu hình AI đã được cập nhật thành công")
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi cập nhật cấu hình",
            )
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <div className="relative">
                    <Input
                        id="openaiApiKey"
                        type={showOpenaiApiKey ? "text" : "password"}
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="Nhập OpenAI API key"
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowOpenaiApiKey(!showOpenaiApiKey)}
                    >
                        {showOpenaiApiKey ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                <div className="relative">
                    <Input
                        id="geminiApiKey"
                        type={showGeminiApiKey ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="Nhập Gemini API key"
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                    >
                        {showGeminiApiKey ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="deepseekApiKey">DeepSeek API Key</Label>
                <div className="relative">
                    <Input
                        id="deepseekApiKey"
                        type={showDeepseekApiKey ? "text" : "password"}
                        value={deepseekApiKey}
                        onChange={(e) => setDeepseekApiKey(e.target.value)}
                        placeholder="Nhập DeepSeek API key"
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                            setShowDeepseekApiKey(!showDeepseekApiKey)
                        }
                    >
                        {showDeepseekApiKey ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                        <SelectValue placeholder="Chọn model AI" />
                    </SelectTrigger>
                    <SelectContent>
                        {AI_MODELS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">
                    Model mặc định cho agent
                </p>
            </div>

            <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu"}
            </Button>
        </form>
    )
}
