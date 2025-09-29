"use client"

import { DashboardHeader } from "@/components/dashboard/sidebar/dashboard-header";
import {
    DepartmentsProvider,
    useDepartments
} from "./_components/department-context";
import { Search } from "@/components/search";
import { DepartmentsTable } from "./_components/department-table";
import { CreateDepartmentDialog } from "./_components/create-department-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function DepartmentsContent() {
    const { setOpen } = useDepartments();

    const handleCreateDepartment = () => {
        setOpen('add');
    };

    return (
        <>
            <DashboardHeader fixed>
                <Search />
            </DashboardHeader>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Phòng ban</h2>
                        <p className="text-muted-foreground">
                            Quản lý thông tin các phòng ban.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button onClick={handleCreateDepartment} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo phòng ban
                        </Button>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <DepartmentsTable />
                </div>
            </div>
            <CreateDepartmentDialog />
        </>
    );
}

export default function Departments() {
    return (
        <DepartmentsProvider>
            <DepartmentsContent />
        </DepartmentsProvider>
    );
}