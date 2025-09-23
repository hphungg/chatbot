"use client";

import { authClient } from "@/lib/db/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { LogoGoogle } from "../icons";

export default function SignInForm() {
    const [ loading, setLoading ] = useState(false);

    async function handleSignIn() {
        setLoading(true);
        const { error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/"
        })
        if (error) {
            toast.error(error.message);
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back!</CardTitle>
                    <CardDescription>
                        Sign in with your Google account to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSignIn()}
                        disabled={loading}
                    >
                        <LogoGoogle />
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}