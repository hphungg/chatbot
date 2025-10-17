import { notFound } from "next/navigation"
import { Chat } from "@/components/chat/chat"
import { ChatHeader } from "@/components/chat/sidebar/chat-header"
import { generateUUID } from "@/lib/utils"
import { getGroupById } from "@/app/api/group/queries"

export default async function Page(props: {
    params: Promise<{ groupId: string }>
}) {
    const params = await props.params
    const { groupId } = params
    const group = await getGroupById(groupId)

    if (!group) {
        notFound()
    }

    const chatId = generateUUID()

    return (
        <div>
            <ChatHeader title={`${group.title} - Cuộc trò chuyện mới`} />
            <Chat id={chatId} groupId={groupId} />
        </div>
    )
}
