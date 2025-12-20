import { prisma } from '@/lib/prisma';

export const getIGDBAccessToken = async (): Promise<string | null> => {
    const existingToken = await prisma.apiToken.findUnique({
        where: { apiName: 'IGDB' },
    });
    if (existingToken && existingToken.expiresAt > new Date()) {
        return existingToken.token;
    } else {
        const tokenRes = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_SECRET}&grant_type=client_credentials`,
            {
                method: 'POST',
            }
        );
        if (!tokenRes.ok) {
            return null;
        }
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in || 5184000;
        const expiresAt = new Date(Date.now() + (expiresIn - 300) * 1000);

        await prisma.$transaction(async (tx) => {
            const tokenInDb = await tx.apiToken.findUnique({
                where: { apiName: 'IGDB' },
            });

            if (!tokenInDb || tokenInDb.expiresAt <= new Date()) {
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
            }
        });
        return accessToken;
    }
};
