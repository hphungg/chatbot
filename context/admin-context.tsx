"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { AdminCommandMenu } from "@/components/admin/command-menu"

interface AdminSearchContextType {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AdminSearchContext = createContext<AdminSearchContextType | null>(null)

interface AdminSearchProviderProps {
    children: React.ReactNode
}

export function AdminSearchProvider({ children }: AdminSearchProviderProps) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [])

    return (
        <AdminSearchContext value={{ open, setOpen }}>
            {children}
            <AdminCommandMenu />
        </AdminSearchContext>
    )
}

export function useAdminSearch() {
    const context = useContext(AdminSearchContext)

    if (!context) {
        throw new Error(
            "useAdminSearch must be used within AdminSearchProvider",
        )
    }

    return context
}
