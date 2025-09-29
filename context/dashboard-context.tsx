"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { CommandMenu } from "@/components/dashboard/command-menu"

type DashboardSearchContextType = {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DashboardSearchContext = createContext<DashboardSearchContextType | null>(
    null,
)

type DashboardSearchProviderProps = {
    children: React.ReactNode
}

export function DashboardSearchProvider({
    children,
}: DashboardSearchProviderProps) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <DashboardSearchContext value={{ open, setOpen }}>
            {children}
            <CommandMenu />
        </DashboardSearchContext>
    )
}

export const useSearch = () => {
    const searchContext = useContext(DashboardSearchContext)

    if (!searchContext) {
        throw new Error("useSearch has to be used within SearchProvider")
    }

    return searchContext
}
