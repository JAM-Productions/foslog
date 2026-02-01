import { MetadataRoute } from 'next';
import { FOSLOG_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/actions/'],
        },
        sitemap: `${FOSLOG_URL}/sitemap.xml`,
    };
}
