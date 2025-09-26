import React from 'react'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

import { ScrollArea } from './ui/scroll-area'
import { sidebarData } from './dashboard/data/sidebar-data'
import { useSearch } from '../context/search-provider'
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
                    {sidebarData.navGroups.map((group) => (
                        <CommandGroup key={group.title} heading={group.title}>
                        {group.items.map((navItem, i) => {
                            if (navItem.url)
                            return (
                                <CommandItem
                                    key={`${navItem.url}-${i}`}
                                    value={navItem.title}
                                    onSelect={() => {
                                        runCommand(() => redirect(navItem.url))
                                    }}
                                >
                                    <div className='flex size-4 items-center justify-center'>
                                        <ArrowRight className='text-muted-foreground/80 size-2' />
                                    </div>
                                    {navItem.title}
                                </CommandItem>
                            )

                            return navItem.items?.map((subItem, i) => (
                            <CommandItem
                                key={`${navItem.title}-${subItem.url}-${i}`}
                                value={`${navItem.title}-${subItem.url}`}
                                onSelect={() => {
                                    runCommand(() => redirect(subItem.url))
                                }}
                            >
                                <div className='flex size-4 items-center justify-center'>
                                <ArrowRight className='text-muted-foreground/80 size-2' />
                                </div>
                                {navItem.title} <ChevronRight /> {subItem.title}
                            </CommandItem>
                            ))
                        })}
                        </CommandGroup>
                    ))}
                </ScrollArea>
            </CommandList>
        </CommandDialog>
    )
}