import { Chat } from "@/components/chat/chat-view";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
    const id = generateUUID();

    return (
        <>
            <Chat
                id={id}
                autoResume={false}
                initialModel="gpt-4o"
                initialMessages={[]}
                key={id}
            />
            {/* <DataStreamHandler /> */}
        </>
    )
}