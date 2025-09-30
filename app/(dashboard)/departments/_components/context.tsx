"use client"

import React, { useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import { CreateDepartmentDialog } from "./create-department-dialog"
import { Department } from "@prisma/client"

type DepartmentsDialogType = "add" | "view"

type DepartmentsContextType = {
    open: DepartmentsDialogType | null
    setOpen: (str: DepartmentsDialogType | null) => void
    currentRow: Department | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Department | null>>
}

const DepartmentsContext = React.createContext<DepartmentsContextType | null>(
    null,
)

export function DepartmentsProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useDialogState<DepartmentsDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Department | null>(null)

    return (
        <DepartmentsContext
            value={{ open, setOpen, currentRow, setCurrentRow }}
        >
            {children}
            <CreateDepartmentDialog />
        </DepartmentsContext>
    )
}

export const useDepartments = () => {
    const departmentsContext = React.useContext(DepartmentsContext)

    if (!departmentsContext) {
        throw new Error(
            "useDepartments has to be used within <DepartmentsContext>",
        )
    }

    return departmentsContext
}
