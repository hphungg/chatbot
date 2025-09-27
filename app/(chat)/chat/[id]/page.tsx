import { Chat } from "@/components/chat/chat";
import { ChatHeader } from "@/components/chat/sidebar/chat-header";

export default async function Page(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;

    return (
        <div>
            <ChatHeader />
            <Chat
                id={id}
            />
        </div>
    )
}