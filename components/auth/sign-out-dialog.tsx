import { authClient } from "@/lib/db/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { useState } from "react"

interface SignOutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSignOut() {
        setLoading(true)
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
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Đăng xuất</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn đăng xuất không?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSignOut}
                        disabled={loading}
                        className="hover:bg-destructive/80 cursor-pointer"
                    >
                        {loading ? "Đang đăng xuất..." : "Đăng xuất"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
