import { createAuthClient } from 'better-auth/react';

const getClientBaseUrl = () => {
    // If explicitly set, use that
    if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
        return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    }

    // For Vercel preview deployments, use VERCEL_URL
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }

    // For browser environment, use current origin
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // Fallback to localhost for development
    return 'http://localhost:3000';
};

export const authClient = createAuthClient({
    baseURL: getClientBaseUrl(),
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
