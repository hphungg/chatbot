import React from 'react'
import { ArrowRight } from 'lucide-react'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '../ui/scroll-area'
import { sidebarData } from '../../constant/sidebar-data'
import { useSearch } from '../../context/dashboard-context'
import { redirect } from 'next/navigation'

export function CommandMenu() {
    const { open, setOpen } = useSearch()

    const runCommand = React.useCallback(
        (command: () => unknown) => {
            setOpen(false)
            command()
        },
        [setOpen]
    )

    return (
        <CommandDialog modal open={open} onOpenChange={setOpen}>
            <CommandInput placeholder='Type a command or search...' />
            <CommandList>
                <ScrollArea type='hover' className='h-72 pe-1'>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup key={"navigation"} heading={"Navigation"}>
                        {
                            sidebarData.map((item) => {
                                return (
                                    <CommandItem
                                        key={item.title}
                                        value={item.title}
                                        onSelect={() => {
                                            runCommand(() => redirect(item.url))
                                        }}
                                    >
                                        <div className='flex size-4 items-center justify-center'>
                                            <ArrowRight className='text-muted-foreground/80 size-2' />
                                        </div>
                                        {item.title}
                                    </CommandItem>
                                )
                            })
                        }
                    </CommandGroup>
                </ScrollArea>
            </CommandList>
        </CommandDialog>
    )
}