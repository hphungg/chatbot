import Link from "next/link"
import { notFound } from "next/navigation"
import { ChatHeader } from "@/components/chat/sidebar/chat-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getGroupById } from "@/app/api/group/queries"
import { getChatByGroupId } from "@/app/api/chat/queries"

export default async function Page(props: {
    params: Promise<{ groupId: string }>
}) {
    const params = await props.params
    const { groupId } = params
    const group = await getGroupById(groupId)

    if (!group) {
        notFound()
    }

    const chats = await getChatByGroupId(groupId)

    return (
        <div className="space-y-6">
            <ChatHeader title={group.title} />
            <div className="space-y-6 px-6">
                <Link
                    href={`/chat/group/${groupId}/new`}
                    className={buttonVariants({ size: "lg" })}
                >
                    Tạo cuộc trò chuyện mới
                </Link>
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">
                        Danh sách cuộc trò chuyện trong dự án
                    </h2>
                    {chats.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Chưa có cuộc trò chuyện nào trong dự án này.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {chats.map((chat) => (
                                <li key={chat.id}>
                                    <Link
                                        href={`/chat/${chat.id}`}
                                        className={cn(
                                            buttonVariants({
                                                variant: "outline",
                                                size: "lg",
                                            }),
                                            "w-full justify-start text-left",
                                        )}
                                    >
                                        {chat.title ||
                                            "Cuộc trò chuyện không tên"}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
