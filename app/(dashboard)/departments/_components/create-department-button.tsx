"use client"

import { Button } from "@/components/ui/button"
import { useDepartments } from "./context"
import { Plus } from "lucide-react"

export function CreateDepartmentButton() {
    const { setOpen } = useDepartments()
    const handleCreateDepartment = () => {
        setOpen("add")
    }

    return (
        <Button onClick={handleCreateDepartment} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo phòng ban
        </Button>
    )
}
