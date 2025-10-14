import { ChatHeader } from "@/components/chat/sidebar/chat-header"
import { Group } from "@/components/group/group"
import { generateUUID } from "@/lib/utils"

export default async function Page() {
    const id = generateUUID()

    return (
        <div>
            <ChatHeader title="Nhóm chat" />
            <Group id={id} />
        </div>
    )
}
