import { prisma } from '@/lib/prisma';
import { IgdbTokenError } from '@/utils/errors';


// In-memory promise to ensure only one token refresh happens at a time.
let inflightTokenRequest: Promise<string> | null = null;

async function fetchAndSaveToken(): Promise<string> {
    // This function contains the core logic for fetching and saving the token.
    // It's only called when a refresh is actually needed.
    const existingToken = await prisma.apiToken.findUnique({
        where: { apiName: 'IGDB' },
    });

    // Check the database for a valid token before attempting to fetch a new one.
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

    await prisma.apiToken.upsert({
        where: { apiName: 'IGDB' },
        update: { token: accessToken, expiresAt },
        create: { token: accessToken, apiName: 'IGDB', expiresAt },
    });

    return accessToken;
}

export function getIgdbToken(): Promise<string> {
    // If a token request is already in flight, return that same promise to all callers.
    if (!inflightTokenRequest) {
        inflightTokenRequest = fetchAndSaveToken().finally(() => {
            // Once the request is complete (whether it succeeds or fails),
            // reset the inflight request so that the next call can trigger a new one.
            inflightTokenRequest = null;
        });
    }

    return inflightTokenRequest;
}
