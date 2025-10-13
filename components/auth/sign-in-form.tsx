"use client"

import { authClient } from "@/lib/db/auth-client"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card"
import { Button } from "../ui/button"
import { IconBrandGoogle } from "@tabler/icons-react"
import { Input } from "../ui/input"

export default function SignInForm() {
    const router = useRouter()
    const [googleLoading, setGoogleLoading] = useState(false)
    const [adminLoading, setAdminLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showAdminForm, setShowAdminForm] = useState(false)

    async function handleGoogleSignIn() {
        setGoogleLoading(true)
        const { error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
            scopes: ["https://www.googleapis.com/auth/calendar"],
        })
        if (error) {
            toast.error(error.message)
        }
        setGoogleLoading(false)
    }

    async function handleAdminSignIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setAdminLoading(true)
        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/admin",
        })
        if (error) {
            toast.error(error.message)
            setAdminLoading(false)
            return
        }
        toast.success("Đăng nhập thành công")
        setAdminLoading(false)
        router.replace("/admin")
        router.refresh()
    }

    const adminDisabled = adminLoading || !email || !password

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Xin chào!</CardTitle>
                    <CardDescription>
                        Đăng nhập bằng tài khoản Google của bạn.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                    >
                        <IconBrandGoogle />
                        Đăng nhập bằng Google
                    </Button>
                </CardContent>
            </Card>
            {!showAdminForm && (
                <div className="text-center">
                    <button
                        type="button"
                        className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
                        onClick={() => setShowAdminForm(true)}
                    >
                        Đăng nhập với tư cách quản trị viên
                    </button>
                </div>
            )}
            {showAdminForm && (
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">
                            Đăng nhập
                        </CardTitle>
                        <CardDescription>
                            Sử dụng email và mật khẩu của quản trị viên.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-3" onSubmit={handleAdminSignIn}>
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                            <Button type="submit" disabled={adminDisabled}>
                                {adminLoading ? "Đang xử lý..." : "Đăng nhập"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
