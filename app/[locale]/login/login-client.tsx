'use client';

import React, { useState } from 'react';
import { Button } from '@/components/button/button';
import { BackButton } from '@/components/button/back-button';
import { Github } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/input/input';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { isUserEmailOk } from '@/utils/userValidationUtils';
import { signIn } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/lib/toast-store';

interface ValidationErrors {
    email?: string;
    password?: string;
}

export default function LoginClient() {
    const tLoginPage = useTranslations('LoginPage');
    const tCTA = useTranslations('CTA');
    const tToast = useTranslations('Toast');
    const router = useRouter();
    const { showToast } = useToastStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {}
    );
    const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);

    const validateEmail = (emailValue: string): string | undefined => {
        if (emailValue.trim() === '') {
            return tLoginPage('validation.emailRequired');
        } else if (!isUserEmailOk(emailValue)) {
            return tLoginPage('validation.emailInvalid');
        }
        return undefined;
    };

    const validatePassword = (passwordValue: string): string | undefined => {
        if (passwordValue.trim() === '') {
            return tLoginPage('validation.passwordRequired');
        }
        return undefined;
    };

    const validateForm = (): ValidationErrors => {
        const errors: ValidationErrors = {};

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError) errors.email = emailError;
        if (passwordError) errors.password = passwordError;

        return errors;
    };

    const handleInputChange = (
        field: keyof ValidationErrors,
        value: string,
        validator: (value: string) => string | undefined
    ) => {
        if (field === 'email') {
            setEmail(value);
        } else if (field === 'password') {
            setPassword(value);
        }

        if (hasAttemptedSignIn) {
            // If user has attempted sign in, validate in real time
            const fieldError = validator(value);
            setValidationErrors((prev) => ({
                ...prev,
                [field]: fieldError,
            }));
        } else if (validationErrors[field]) {
            // Clear validation error when user starts typing
            setValidationErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handleSignIn = async () => {
        setHasAttemptedSignIn(true);
        const errors = validateForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            setError(null);

            try {
                const result = await signIn.email({
                    email,
                    password,
                    callbackURL: '/',
                });

                if (result.data) {
                    showToast(tToast('loginSuccess'), 'success');
                    router.push('/');
                } else if (result.error) {
                    setError(result.error.message || 'Login failed');
                    showToast(tToast('loginFailed'), 'error');
                }
            } catch (err) {
                setError('An unexpected error occurred');
                showToast(tToast('loginFailed'), 'error');
                console.error('Login error:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSocialSignIn = async (provider: 'google' | 'github') => {
        setIsLoading(true);
        setError(null);

        try {
            await signIn.social({
                provider,
                callbackURL: '/',
            });
        } catch (err) {
            setError(`${provider} login failed`);
            console.error(`${provider} login error:`, err);
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background absolute top-0 z-50 flex min-h-screen w-screen items-center justify-center">
            <div className="bg-muted mx-5 w-full max-w-md rounded-md border p-7">
                <div className="mb-4 flex items-center justify-start">
                    <BackButton />
                </div>
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
                        {tLoginPage('welcomeBack')}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {tLoginPage('description')}
                    </p>
                </div>
                <form
                    className="mb-5 flex flex-col gap-4.5"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSignIn();
                    }}
                >
                    <div className="flex flex-col">
                        <Input
                            type="text"
                            placeholder={tLoginPage('email')}
                            name="email"
                            value={email}
                            onChange={(e) =>
                                handleInputChange(
                                    'email',
                                    e.target.value,
                                    validateEmail
                                )
                            }
                            className={
                                validationErrors.email ? 'border-red-500' : ''
                            }
                        />
                        {validationErrors.email && (
                            <span className="mt-1.5 text-xs text-red-500">
                                {validationErrors.email}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <Input
                            type="password"
                            placeholder={tLoginPage('password')}
                            name="password"
                            value={password}
                            onChange={(e) =>
                                handleInputChange(
                                    'password',
                                    e.target.value,
                                    validatePassword
                                )
                            }
                            className={
                                validationErrors.password
                                    ? 'border-red-500'
                                    : ''
                            }
                        />
                        {validationErrors.password && (
                            <span className="mt-1.5 text-xs text-red-500">
                                {validationErrors.password}
                            </span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="mb-4 w-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? tLoginPage('loggingIn')
                            : tLoginPage('login')}
                    </Button>
                </form>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-background text-muted-foreground px-2">
                            {tLoginPage('orContinueWith')}
                        </span>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-5">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSocialSignIn('google')}
                        disabled={isLoading}
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
                        onClick={() => handleSocialSignIn('github')}
                        disabled={isLoading}
                    >
                        <Github className="mr-2 h-4 w-4" />
                        {tCTA('github')}
                    </Button>
                </div>
                <div className="mt-5 flex justify-center">
                    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-center sm:gap-2">
                        {tLoginPage('noAccount')}
                        <Link
                            href="/signup"
                            className="text-primary"
                        >
                            {tLoginPage('signUp')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
