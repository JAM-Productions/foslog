'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Mail } from 'lucide-react';
import Image from 'next/image';
/* import { useTranslations } from 'next-intl'; */

export default function LoginPage() {
    /* const t = useTranslations('LoginPage'); */

    return (
        <div className="bg-background absolute top-0 z-50 flex min-h-screen w-screen items-center justify-center">
            <div className="bg-muted min-w-md rounded-md border p-7">
                <div className="mb-7.5 flex items-center justify-center">
                    <Image
                        src="/icon1.png"
                        alt="Foslog"
                        width={70}
                        height={70}
                    />
                </div>
                <div className="mb-6 flex flex-col text-center">
                    <h2 className="text-2xl font-semibold">Welcome back</h2>
                    <p className="text-muted-foreground text-sm">
                        Sign in to your Foslog account
                    </p>
                </div>
                <div className="mb-5 flex flex-col gap-4.5">
                    <input
                        type="text"
                        className="border-primary focus:ring-primary rounded-lg border bg-black/40 px-4 py-2 focus:ring-2 focus:outline-none"
                        placeholder="Email"
                    />
                    <input
                        type="password"
                        className="border-primary focus:ring-primary rounded-lg border bg-black/40 px-4 py-2 focus:ring-2 focus:outline-none"
                        placeholder="Password"
                    />
                </div>
                <Button className="mb-4 w-full">Sign in</Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-background text-muted-foreground px-2">
                            Or continue with
                        </span>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-5">
                    <Button
                        variant="outline"
                        className="flex-1"
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                    >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                    </Button>
                </div>
                <div className="mt-5 flex justify-center">
                    <p>
                        Don&apos;t have an account?{' '}
                        <a
                            href="#"
                            className="text-primary"
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
