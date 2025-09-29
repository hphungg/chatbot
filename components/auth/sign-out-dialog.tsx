import { ConfirmDialog } from "@/components/confirm-dialog"
import { authClient } from "@/lib/db/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SignOutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    const router = useRouter()

    async function handleSignOut() {
        await authClient.signOut({
            fetchOptions: {
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    router.push("/sign-in")
                    onOpenChange(false)
                },
            },
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Đăng xuất"
            desc="Bạn có chắc chắn muốn đăng xuất không?"
            confirmText="Đăng xuất"
            cancelBtnText="Hủy"
            handleConfirm={handleSignOut}
            className="sm:max-w-sm"
        />
    )
}
