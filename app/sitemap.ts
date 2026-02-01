import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { LOCALES } from '@/lib/constants';
import { getAllBlogPosts } from '@/utils/blog-utils';

const baseUrl = 'http://foslog.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemap: MetadataRoute.Sitemap = [];

    // Static routes for each locale
    const staticRoutes = [
        '',
        '/blog',
        '/login',
        '/signup',
        '/privacy-policy',
        '/terms-of-service',
    ];

    for (const locale of LOCALES) {
        for (const route of staticRoutes) {
            sitemap.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: route === '/blog' ? 'weekly' : 'monthly',
                priority: route === '' ? 1.0 : 0.8,
            });
        }
    }

    // Dynamic routes - Media items
    try {
        const mediaItems = await prisma.mediaItem.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        for (const locale of LOCALES) {
            for (const media of mediaItems) {
                sitemap.push({
                    url: `${baseUrl}/${locale}/media/${media.id}`,
                    lastModified: media.updatedAt,
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            }
        }
    } catch (error) {
        console.error('Error fetching media items for sitemap:', error);
    }

    // Dynamic routes - Reviews
    try {
        const reviews = await prisma.review.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        for (const locale of LOCALES) {
            for (const review of reviews) {
                sitemap.push({
                    url: `${baseUrl}/${locale}/review/${review.id}`,
                    lastModified: review.updatedAt,
                    changeFrequency: 'monthly',
                    priority: 0.6,
                });
            }
        }
    } catch (error) {
        console.error('Error fetching reviews for sitemap:', error);
    }

    // Dynamic routes - User profiles
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        for (const locale of LOCALES) {
            for (const user of users) {
                sitemap.push({
                    url: `${baseUrl}/${locale}/profile/${user.id}`,
                    lastModified: user.updatedAt,
                    changeFrequency: 'weekly',
                    priority: 0.5,
                });
            }
        }
    } catch (error) {
        console.error('Error fetching users for sitemap:', error);
    }

    // Dynamic routes - Blog posts
    for (const locale of LOCALES) {
        try {
            const blogPosts = await getAllBlogPosts(locale);

            for (const post of blogPosts) {
                sitemap.push({
                    url: `${baseUrl}/${locale}/blog/${post.slug}`,
                    lastModified: post.date ? new Date(post.date) : new Date(),
                    changeFrequency: 'monthly',
                    priority: 0.7,
                });
            }
        } catch (error) {
            console.error(
                `Error fetching blog posts for locale ${locale}:`,
                error
            );
        }
    }

    return sitemap;
}
