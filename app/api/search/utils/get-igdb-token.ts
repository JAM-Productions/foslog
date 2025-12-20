import { prisma } from '@/lib/prisma';

export class IgdbTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IgdbTokenError';
    }
}

export async function getIgdbToken(): Promise<string> {
    const existingToken = await prisma.apiToken.findUnique({
        where: { apiName: 'IGDB' },
    });

    if (existingToken && existingToken.expiresAt > new Date()) {
        return existingToken.token;
    }

    const tokenRes = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_SECRET}&grant_type=client_credentials`,
        {
            method: 'POST',
        }
    );

    if (!tokenRes.ok) {
        throw new IgdbTokenError('Failed to fetch IGDB access token');
    }

    type TokenResponse = {
        access_token: string;
        expires_in?: number;
    };

    const tokenData = (await tokenRes.json()) as Partial<TokenResponse>;

    if (!tokenData.access_token) {
        throw new IgdbTokenError(
            'IGDB token response did not include an access token'
        );
    }

    const accessToken: string = tokenData.access_token;
    const expiresIn: number = tokenData.expires_in ?? 5184000; // Default to 60 days
    const expiresAt = new Date(
        Date.now() + (expiresIn - 300) * 1000 // Subtract 5 minutes for safety
    );

    await prisma.$transaction(async (tx) => {
        await tx.apiToken.upsert({
            where: { apiName: 'IGDB' },
            update: {
                token: accessToken,
                expiresAt,
            },
            create: {
                token: accessToken,
                apiName: 'IGDB',
                expiresAt,
            },
        });
    });

    return accessToken;
}
