import { ConfirmDialog } from '@/components/confirm-dialog'
import { authClient } from '@/lib/db/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SignOutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    const router = useRouter();

    async function handleSignOut() {
        await authClient.signOut({
            fetchOptions: {
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    router.push('/sign-in');
                    onOpenChange(false);
                }
            }
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title='Sign out'
            desc='Are you sure you want to sign out?'
            confirmText='Sign out'
            handleConfirm={handleSignOut}
            className='sm:max-w-sm'
        />
    )
}