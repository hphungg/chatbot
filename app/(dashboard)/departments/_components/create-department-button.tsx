"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDepartments } from "./department-provider";

export function CreateDepartmentButton() {
    const { setOpen } = useDepartments();

    const handleCreateDepartment = () => {
        setOpen('add');
    };

    return (
        <Button onClick={handleCreateDepartment} className="gap-2">
            <Plus className="h-4 w-4" />
            Create new Department
        </Button>
    );
}