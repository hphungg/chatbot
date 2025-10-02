"use client"

import { ArrowRight } from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { adminSidebarData } from "@/constant/admin-sidebar-data"
import { useAdminSearch } from "@/context/admin-context"
import { useRouter } from "next/navigation"

export function AdminCommandMenu() {
    const router = useRouter()
    const { open, setOpen } = useAdminSearch()

    const runCommand = (callback: () => void) => {
        setOpen(false)
        callback()
    }

    return (
        <CommandDialog modal open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Tìm kiếm trang quản trị..." />
            <CommandList>
                <ScrollArea type="hover" className="h-72 pe-1">
                    <CommandEmpty>Không tìm thấy kết quả phù hợp.</CommandEmpty>
                    <CommandGroup heading="Đi tới">
                        {adminSidebarData.map((item) => (
                            <CommandItem
                                key={item.title}
                                value={item.title}
                                onSelect={() =>
                                    runCommand(() => router.push(item.url))
                                }
                            >
                                <div className="flex size-4 items-center justify-center">
                                    <ArrowRight className="text-muted-foreground/80 size-2" />
                                </div>
                                {item.title}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </ScrollArea>
            </CommandList>
        </CommandDialog>
    )
}
