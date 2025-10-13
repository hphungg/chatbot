import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import { admin as adminPlugin } from "better-auth/plugins"
import { prisma } from "./db/prisma"

const allowEmailSignUp =
    (process.env.ALLOW_EMAIL_SIGN_UP ?? "").toLowerCase() === "true"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: !allowEmailSignUp,
        minPasswordLength: 4,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
            prompt: "select_account consent",
        },
    },
    plugins: [
        adminPlugin({
            adminRoles: ["admin"],
            defaultRole: "employee",
        }),
    ],
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            if (!ctx.path.startsWith("/sign-in")) {
                return
            }
            const newSession = ctx.context.newSession
            if (!newSession) {
                return
            }
            const { user } = newSession
            if (user.displayName || !user.name) {
                return
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { displayName: user.name },
            })
        }),
    },
})
