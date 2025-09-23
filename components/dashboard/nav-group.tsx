import { ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "../ui/sidebar";
import {
    NavCollapsible,
    NavLink,
    type NavGroup as NavGroupProps
} from "./data/types";

import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavGroup({ title, items }: NavGroupProps) {
    const { state, isMobile } = useSidebar();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {
                    items.map((item) => {
                        const key = `${item.title}-${item.url}`

                        if (!item.items) {
                            return <SidebarMenuLink key={key} item={item} />
                        }

                        if (state === 'collapsed' && !isMobile) {
                            return <SidebarMenuCollapsedDropdown key={key} item={item} />
                        }

                        return <SidebarMenuCollapsible key={key} item={item} />
                    })
                }
            </SidebarMenu>
        </SidebarGroup>
    )
};

function SidebarMenuLink({ item }: { item: NavLink }) {
    const { setOpenMobile } = useSidebar();
    const pathname = usePathname();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={item.url === pathname}
                tooltip={item.title}
            >
                <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge &&
                        <Badge className='rounded-full px-1 py-0 text-xs'>
                            {item.badge}
                        </Badge>
                    }
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

function SidebarMenuCollapsible({ item }: { item: NavCollapsible }) {
    const { setOpenMobile } = useSidebar();
    const pathname = usePathname();

    return (
        <Collapsible
            asChild
            defaultOpen={item.url === pathname}
            className='group/collapsible'
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge &&
                            <Badge className='rounded-full px-1 py-0 text-xs'>
                                {item.badge}
                            </Badge>
                        }
                        <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className='CollapsibleContent'>
                    <SidebarMenuSub>
                        {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                                asChild
                                isActive={subItem.url === pathname}
                            >
                                <Link
                                    href={subItem.url}
                                    onClick={() => setOpenMobile(false)}
                                >
                                    {subItem.icon && <subItem.icon />}
                                    <span>{subItem.title}</span>
                                    {subItem.badge &&
                                        <Badge className='rounded-full px-1 py-0 text-xs'>
                                            {subItem.badge}
                                        </Badge>
                                    }
                                </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

function SidebarMenuCollapsedDropdown({ item }: { item: NavCollapsible }) {
    const pathname = usePathname();

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        tooltip={item.title}
                        isActive={item.url === pathname}
                    >
                        {item.icon && <item.icon />}

                        <span>{item.title}</span>

                        {item.badge &&
                            <Badge className='rounded-full px-1 py-0 text-xs'>
                                {item.badge}
                            </Badge>
                        }

                        <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='right' align='start' sideOffset={4}>
                    <DropdownMenuLabel>
                        {item.title} {item.badge ? `(${item.badge})` : ''}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items.map((sub) => (
                        <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                            <Link
                                href={sub.url}
                                className={`${sub.url === pathname ? 'bg-secondary' : ''}`}
                            >
                                {sub.icon && <sub.icon />}

                                <span className='max-w-52 text-wrap'>
                                    {sub.title}
                                </span>

                                {sub.badge && (
                                    <span className='ms-auto text-xs'>
                                        {sub.badge}
                                    </span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}