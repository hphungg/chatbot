import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function UnverifiedPage() {
    const session = await auth.api
        .getSession({
            headers: await headers(),
        })
        .catch(() => null)

    if (!session) {
        redirect("/sign-in")
    }

    if (session.user.userVerified) {
        redirect("/")
    }

    return (
        <div className="bg-muted/40 flex min-h-svh items-center justify-center px-4 py-16">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Tài khoản chưa được xác thực</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-4 text-sm">
                    <p>Bạn không có quyền truy cập vào hệ thống.</p>
                    <p>
                        Tài khoản của bạn cần được xác thực bởi quản lý trước
                        khi có thể đăng nhập vào hệ thống.
                    </p>
                </CardContent>
                <CardFooter className="w-full">
                    <Button asChild className="w-full">
                        <Link href="/sign-in">Quay về</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
