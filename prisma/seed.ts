import "dotenv/config"

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME ?? "Administrator"

    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set")
    }

    const { auth } = await import("@/lib/auth")
    const { prisma } = await import("@/lib/db/prisma")

    const existing = await prisma.user.findUnique({
        where: { email: adminEmail },
    })

    if (existing) {
        if (
            existing.role !== "admin" ||
            existing.displayName !== existing.name
        ) {
            await prisma.user.update({
                where: { id: existing.id },
                data: {
                    role: "admin",
                    displayName: existing.displayName ?? existing.name,
                },
            })
        }
        await prisma.$disconnect()
        console.log("Admin user already exists")
        return
    }

    await auth.api.signUpEmail({
        body: {
            email: adminEmail,
            password: adminPassword,
            name: adminName,
        },
    })

    await prisma.user.update({
        where: { email: adminEmail },
        data: {
            role: "admin",
            displayName: adminName,
        },
    })

    await prisma.$disconnect()
    console.log("Admin user created")
}

main().catch(async (error) => {
    console.error(error)
    const { prisma } = await import("@/lib/db/prisma")
    await prisma.$disconnect()
    process.exit(1)
})
