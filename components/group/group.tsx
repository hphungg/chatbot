"use client";

interface GroupProps {
    id: string;
}

export function Group( {
    id,
}: GroupProps) {
    // const { addChat } = useChatContext();
    // const [ input, setInput ] = useState<string>("");
    // const [ attachments, setAttachments ] = useState<Attachment[]>([]);
    // const [ chatCreated, setChatCreated ] = useState(initialMessages.length > 0);

    // const {
    //     messages,
    //     setMessages,
    //     sendMessage,
    //     status,
    //     stop,
    // } = useChat({
    //     id,
    //     messages: initialMessages,
    //     generateId: generateUUID,
    //     transport: new DefaultChatTransport({
    //         api: "/api/chat",
    //         prepareSendMessagesRequest(request) {
    //             return {
    //                 body: {
    //                     chatId: request.id,
    //                     message: request.messages.at(-1),
    //                     ...request.body,
    //                 }
    //             }
    //         }
    //     }),
    //     onFinish: async () => {
    //         if (!chatCreated && initialMessages.length === 0) {
    //             try {
    //                 const newChat = await getChatById(id);
    //                 if (newChat) {
    //                     addChat(newChat);
    //                     setChatCreated(true);
    //                 }
    //             } catch (error) {
    //                 console.error("Error fetching new chat:", error);
    //             }
    //         }
    //     }
    // });

    return (
        <div className="max-w-4xl mx-auto relative size-full h-[calc(100vh-4rem)] rounded-lg">
            Hello
        </div>
    )
}