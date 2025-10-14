import { customSessionClient } from "better-auth/client/plugins"
import { nextCookies } from "better-auth/next-js"
import { createAuthClient } from "better-auth/react"
import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [nextCookies(), customSessionClient<typeof auth>()],
})
