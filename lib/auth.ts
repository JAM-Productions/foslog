import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

const getBaseUrl = () => {
    if (process.env.BETTER_AUTH_URL) {
        return process.env.BETTER_AUTH_URL;
    }
    if (process.env.VERCEL_ENV === 'production') {
        return 'https://foslog.vercel.app';
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return 'http://localhost:3000';
};

const trustedOrigins = ['http://localhost:3000', 'https://foslog.vercel.app'];

if (process.env.VERCEL_URL) {
    trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // TODO: Set to true in production in a future
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: getBaseUrl(),
    trustedOrigins,
    advanced: {
        database: {
            generateId: () => {
                return crypto.randomUUID();
            },
        },
    },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
