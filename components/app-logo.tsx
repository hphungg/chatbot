import { BotIcon } from "lucide-react"

export default function AppLogo({ className }: { className?: string }) {
    return (
        <div className={`flex cursor-pointer items-center gap-2 ${className}`}>
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <BotIcon className="size-4" />
            </div>
            <a className="text-xl font-semibold">Chatbot</a>
        </div>
    )
}
