import { getChatById } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function Page(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const chat = await getChatById({ id })
    if (!chat) {
        notFound();
    }

    // TO-DO: implement the rest of the chat page
}