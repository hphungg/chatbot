import { BotIcon } from "lucide-react";

export default function AppLogo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <BotIcon className="size-4" />
            </div>
            <a className="font-semibold text-xl">Chatbot</a>
        </div>
    );
}
