import { betterAuth, type BetterAuthOptions } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import { admin, customSession } from "better-auth/plugins"
import { ac, boss, manager, employee } from "./permission"
import { prisma } from "./db/prisma"

interface ExtendedUserFields {
    displayName?: string | null
    userVerified?: boolean | null
}

const authOptions = {
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
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
        admin({
            ac,
            adminRoles: ["boss"],
            roles: {
                boss,
                manager,
                employee,
            },
            defaultRole: "employee",
        }),
    ],
    user: {
        additionalFields: {
            displayName: { type: "string", required: true },
            userVerified: { type: "boolean", required: true },
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            const newSession = ctx.context.newSession
            if (!newSession) {
                return
            }
            const { user } = newSession
            const normalizedEmail = user.email.toLowerCase()
            const invitedUser = await prisma.invitedUser.findUnique({
                where: { email: normalizedEmail },
            })
            const updates: {
                displayName?: string
                userVerified?: boolean
                role?: string
            } = {}
            if (user.name && !user.displayName) {
                updates.displayName = user.name
            }
            if (invitedUser && !user.userVerified) {
                updates.userVerified = true
                await prisma.invitedUser.delete({
                    where: { email: normalizedEmail },
                })
            }
            if (Object.keys(updates).length > 0) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: updates,
                })
            }
        }),
    },
} satisfies BetterAuthOptions

export const auth = betterAuth({
    ...authOptions,
    plugins: [
        ...(authOptions.plugins ?? []),
        customSession(async ({ user, session }) => {
            return {
                user: {
                    ...user,
                    displayName: user.displayName ?? user.name,
                    userVerified: user.userVerified,
                },
                session,
            }
        }, authOptions),
    ],
})
