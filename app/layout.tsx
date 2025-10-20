import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "vietnamese"],
})

export const metadata: Metadata = {
    title: "Chatbot",
    description: "A chatbot application built with Next.js",
}

export const viewport = {
    maximumScale: 1,
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="vi">
            <body
                suppressHydrationWarning
                className={`${inter.className} antialiased`}
            >
                <Toaster position="top-right" richColors />
                {children}
            </body>
        </html>
    )
}
