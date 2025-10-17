import { ChatHeader } from "@/components/chat/sidebar/chat-header"

export default function Page() {
    return (
        <div className="space-y-6">
            <ChatHeader title="Dự án" />
            <div className="text-muted-foreground px-6 text-sm">
                Chọn một dự án trên thanh điều hướng.
            </div>
        </div>
    )
}
