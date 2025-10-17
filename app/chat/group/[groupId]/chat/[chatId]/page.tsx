import { redirect } from "next/navigation"

export default async function Page(props: {
    params: Promise<{ groupId: string; chatId: string }>
}) {
    const params = await props.params
    const { chatId } = params

    redirect(`/chat/${chatId}`)
}
