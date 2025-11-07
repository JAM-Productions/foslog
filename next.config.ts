import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    images: {
        domains: [
            'image.tmdb.org',
            'pics.filmaffinity.com',
            'cdn.cloudflare.steamstatic.com',
            'images-na.ssl-images-amazon.com',
            'upload.wikimedia.org',
            'api.dicebear.com'
        ],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
