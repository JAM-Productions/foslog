'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Github } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input/input';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { isUserEmailOk } from '@/utils/userValidationUtils';
import { signUp, signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface ValidationErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterPage() {
    const tRegisterPage = useTranslations('RegisterPage');
    const tCTA = useTranslations('CTA');
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {}
    );
    const [hasAttemptedSignUp, setHasAttemptedSignUp] = useState(false);

    const validateName = (nameValue: string): string | undefined => {
        if (nameValue.trim() === '') {
            return tRegisterPage('validation.nameRequired');
        } else if (nameValue.trim().length < 2) {
            return tRegisterPage('validation.nameTooShort');
        }
        return undefined;
    };

    const validateEmail = (emailValue: string): string | undefined => {
        if (emailValue.trim() === '') {
            return tRegisterPage('validation.emailRequired');
        } else if (!isUserEmailOk(emailValue)) {
            return tRegisterPage('validation.emailInvalid');
        }
        return undefined;
    };

    const validatePassword = (passwordValue: string): string | undefined => {
        if (passwordValue.trim() === '') {
            return tRegisterPage('validation.passwordRequired');
        } else if (passwordValue.length < 8) {
            return tRegisterPage('validation.passwordTooShort');
        }
        return undefined;
    };

    const validateConfirmPassword = (
        confirmPasswordValue: string,
        passwordValue?: string
    ): string | undefined => {
        if (confirmPasswordValue.trim() === '') {
            return tRegisterPage('validation.confirmPasswordRequired');
        } else if (confirmPasswordValue !== (passwordValue ?? password)) {
            return tRegisterPage('validation.passwordsDoNotMatch');
        }
        return undefined;
    };

    const validateForm = (): ValidationErrors => {
        const errors: ValidationErrors = {};

        const nameError = validateName(name);
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(confirmPassword);

        if (nameError) errors.name = nameError;
        if (emailError) errors.email = emailError;
        if (passwordError) errors.password = passwordError;
        if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

        return errors;
    };

    const handleInputChange = (
        field: keyof ValidationErrors,
        value: string,
        validator: (value: string) => string | undefined
    ) => {
        if (field === 'name') {
            setName(value);
        } else if (field === 'email') {
            setEmail(value);
        } else if (field === 'password') {
            setPassword(value);
        } else if (field === 'confirmPassword') {
            setConfirmPassword(value);
        }

        if (hasAttemptedSignUp) {
            // If user has attempted sign up, validate in real time
            const fieldError = validator(value);
            const newErrors: ValidationErrors = {
                ...validationErrors,
                [field]: fieldError,
            };

            // If password is changing, re-validate confirm password with the new password value
            if (field === 'password' && confirmPassword) {
                const confirmPasswordError = validateConfirmPassword(
                    confirmPassword,
                    value
                );
                newErrors.confirmPassword = confirmPasswordError;
            }

            setValidationErrors(newErrors);
        } else if (validationErrors[field]) {
            // Clear validation error when user starts typing
            const newErrors = {
                ...validationErrors,
                [field]: undefined,
            };

            // If password is changing and there's a confirm password error, clear it too
            if (field === 'password' && validationErrors.confirmPassword) {
                newErrors.confirmPassword = undefined;
            }

            setValidationErrors(newErrors);
        }
    };

    const handleSignUp = async () => {
        setHasAttemptedSignUp(true);
        const errors = validateForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            setError(null);

            try {
                const result = await signUp.email({
                    name,
                    email,
                    password,
                    callbackURL: '/',
                });

                if (result.data) {
                    router.push('/');
                } else if (result.error) {
                    setError(result.error.message || 'Sign up failed');
                }
            } catch (err) {
                setError('An unexpected error occurred');
                console.error('Sign up error:', err);
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
            setError(`${provider} sign up failed`);
            console.error(`${provider} sign up error:`, err);
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
                    <div className="flex flex-col">
                        <Input
                            type="text"
                            placeholder={tRegisterPage('name')}
                            name="name"
                            value={name}
                            onChange={(e) =>
                                handleInputChange(
                                    'name',
                                    e.target.value,
                                    validateName
                                )
                            }
                            className={
                                validationErrors.name ? 'border-red-500' : ''
                            }
                        />
                        {validationErrors.name && (
                            <span className="mt-1.5 text-xs text-red-500">
                                {validationErrors.name}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <Input
                            type="email"
                            placeholder={tRegisterPage('email')}
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
                            placeholder={tRegisterPage('password')}
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
                    <div className="flex flex-col">
                        <Input
                            type="password"
                            placeholder={tRegisterPage('confirmPassword')}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) =>
                                handleInputChange(
                                    'confirmPassword',
                                    e.target.value,
                                    (value) => validateConfirmPassword(value)
                                )
                            }
                            className={
                                validationErrors.confirmPassword
                                    ? 'border-red-500'
                                    : ''
                            }
                        />
                        {validationErrors.confirmPassword && (
                            <span className="mt-1.5 text-xs text-red-500">
                                {validationErrors.confirmPassword}
                            </span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="mb-4 w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : tCTA('signUp')}
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
                            {tRegisterPage('orContinueWith')}
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
                    <div className="flex flex-col items-center gap-0.5 text-center sm:flex-row sm:items-center sm:gap-2">
                        {tRegisterPage('alreadyHaveAccount')}
                        <Link
                            href="/login"
                            className="text-primary"
                        >
                            {tRegisterPage('login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
