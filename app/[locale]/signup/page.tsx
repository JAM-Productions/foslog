'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const tRegisterPage = useTranslations('RegisterPage');
    const tCTA = useTranslations('CTA');

    const handleSignUp = () => {
        console.log('Sign up clicked');
    };

    return (
        <div className="bg-background absolute top-0 z-50 flex min-h-screen w-screen items-center justify-center">
            <div className="bg-muted mx-5 w-full max-w-md rounded-md border p-7">
                <div className="mb-2 flex items-center justify-center">
                    <Image
                        src="/icon1.png"
                        alt="Foslog"
                        width={70}
                        height={70}
                    />
                </div>
                <div className="mb-6 flex flex-col text-center">
                    <h2 className="text-2xl font-semibold">
                        {tRegisterPage('createAccount')}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {tRegisterPage('description')}
                    </p>
                </div>
                <form
                    className="mb-5 flex flex-col gap-4.5"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSignUp();
                    }}
                >
                    <Input
                        type="email"
                        placeholder={tRegisterPage('email')}
                        name="email"
                        required
                    />
                    <Input
                        type="password"
                        placeholder={tRegisterPage('password')}
                        name="password"
                        required
                    />
                    <Input
                        type="password"
                        placeholder={tRegisterPage('confirmPassword')}
                        name="confirmPassword"
                        required
                    />

                    <Button
                        type="submit"
                        className="mb-4 w-full"
                    >
                        {tCTA('signIn')}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-background text-muted-foreground px-2">
                            {tRegisterPage('orContinueWith')}
                        </span>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-5">
                    <Button
                        variant="outline"
                        className="flex-1"
                    >
                        <div className="flex items-center gap-2.5">
                            <Image
                                src="/google_favicon_2025.svg"
                                alt="Google"
                                width={16}
                                height={16}
                            />
                            {tCTA('google')}
                        </div>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                    >
                        <Github className="mr-2 h-4 w-4" />
                        {tCTA('github')}
                    </Button>
                </div>
                <div className="mt-5 flex justify-center">
                    <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                        {tRegisterPage('alreadyHaveAccount')}
                        <Link
                            href="/login"
                            className="text-primary"
                        >
                            {tRegisterPage('signIn')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
