import { Chat } from "@/components/chat/chat"
import { ChatHeader } from "@/components/chat/sidebar/chat-header"
import { generateUUID } from "@/lib/utils"

export default async function Page() {
    const id = generateUUID()

    return (
        <div>
            <ChatHeader />
            <Chat id={id} />
        </div>
    )
}
