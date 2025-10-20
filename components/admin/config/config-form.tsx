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
] as const

interface ConfigFormProps {
    initialConfig: AIConfig
}

export function ConfigForm({ initialConfig }: ConfigFormProps) {
    const [apiKey, setApiKey] = useState(initialConfig.apiKey)
    const [model, setModel] = useState(initialConfig.model)
    const [showApiKey, setShowApiKey] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            await updateAIConfig({ apiKey, model })
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
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                    <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Nhập API key của bạn"
                        className="pr-10"
                        required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                    >
                        {showApiKey ? (
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
                    Model được sử dụng cho AI agent
                </p>
            </div>

            <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu"}
            </Button>
        </form>
    )
}
