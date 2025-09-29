import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../../ui/sidebar";
import useDialogState from "@/hooks/use-dialog-state";
import { SignOutDialog } from "../../auth/sign-out-dialog";
import { User } from "@/lib/types";
import Link from "next/link";
import { DashboardIcon } from "@radix-ui/react-icons";

export function SidebarUser({ user }: { user: User }) {
    const { isMobile } = useSidebar();
    const [ open, setOpen ] = useDialogState();

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size='lg'>
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarImage src={user.image as string} alt={user?.name} />
                                    <AvatarFallback className="rounded-lg">U</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-start text-base ml-1">
                                    <span className="truncate font-semibold">{user?.name}</span>
                                    <span className="truncate text-xs">{user?.email}</span>
                                </div>
                                <ChevronDown className="ms-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                            side={isMobile ? 'bottom' : 'right'}
                            align='end'
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className='flex items-center px-1 py-1.5 gap-2 text-base'>
                                    <Avatar className='h-8 w-8 rounded-full'>
                                        <AvatarImage src={user.image as string} alt={user.name} />
                                        <AvatarFallback className='rounded-lg'>U</AvatarFallback>
                                    </Avatar>
                                    <div className='grid flex-1 ml-1'>
                                        <span className='truncate font-semibold'>{user.name}</span>
                                        <span className='truncate text-xs'>{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <DashboardIcon />
                                <Link href="/" className="ml-2">Hồ sơ</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setOpen(true)} className="cursor-pointer">
                                <LogOut />
                                <span className="ml-2">Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <SignOutDialog open={!!open} onOpenChange={setOpen} />
        </>
    )
}