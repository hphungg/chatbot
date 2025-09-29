"use client";

import React, { useState, useEffect } from "react";
import { ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { User as UserType } from "@/lib/types";
import { getAllUsers } from "@/app/api/users/queries";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface EmployeeSelectorProps {
    selectedEmployees: string[];
    onSelectionChange: (employees: string[]) => void;
}

export function EmployeeSelector({ selectedEmployees, onSelectionChange }: EmployeeSelectorProps) {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await getAllUsers();
                setUsers(response);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const toggleEmployee = (employeeId: string) => {
        const isSelected = selectedEmployees.includes(employeeId);
        if (isSelected) {
            onSelectionChange(selectedEmployees.filter(id => id !== employeeId));
        } else {
            onSelectionChange([...selectedEmployees, employeeId]);
        }
    };

    return (
        <div className="w-full space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-normal"
                    >
                        <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {selectedEmployees.length === 0 ? (
                                <span className="text-muted-foreground">Thêm nhân viên...</span>
                            ) : (
                                <span>{selectedEmployees.length} nhân viên được chọn</span>
                            )}
                            </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Tìm kiếm tên nhân viên..." />
                        <CommandList>
                            {loading ? (
                                <CommandEmpty>Đang tải nhân viên...</CommandEmpty>
                            ) : (
                                <>
                                    <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                                    <CommandGroup>
                                        <div className="max-h-60 overflow-y-auto space-y-1">
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={user.name}
                                                    onSelect={() => toggleEmployee(user.id)}
                                                >
                                                        <Checkbox
                                                            checked={selectedEmployees.includes(user.id)}
                                                            onCheckedChange={() => toggleEmployee(user.id)}
                                                        />
                                                        <Avatar>
                                                            <AvatarImage src={user.image as string} />
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span>{user.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                </CommandItem>
                                            ))}
                                        </div>
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}