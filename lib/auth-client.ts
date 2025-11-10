import { createAuthClient } from 'better-auth/react';

const baseURL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? 'https://foslog.vercel.app'
        : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

export const authClient = createAuthClient({
    baseURL: baseURL!,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
