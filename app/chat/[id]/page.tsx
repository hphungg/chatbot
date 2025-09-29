import { getChatById, getMessagesByChatId } from "@/app/api/chat/queries";
import { Chat } from "@/components/chat/chat";
import { ChatHeader } from "@/components/chat/sidebar/chat-header";
import { convertToUIMessages } from "@/lib/ai/actions";
import { notFound } from "next/navigation";

export default async function Page(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const chat = await getChatById(id);

    if (!chat) {
        notFound();
    }

    const messagesFromDatabase = await getMessagesByChatId(id);
    const uiMessages = convertToUIMessages({messages: messagesFromDatabase});

    return (
        <div>
            <ChatHeader />
            <Chat
                id={id}
                initialMessages={uiMessages}
            />
        </div>
    )
}