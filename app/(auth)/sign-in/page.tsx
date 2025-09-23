import AppLogo from "@/components/app-logo";
import SignInForm from "@/components/auth/sign-in-form";

export default function SignInPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <AppLogo className="items-center justify-center" />
                <SignInForm />
                <div className="text-muted-foreground text-center text-xs text-balance">
                    By signing in, you agree to our term of service and privacy policy.
                </div>
            </div>
        </div>
    )
}