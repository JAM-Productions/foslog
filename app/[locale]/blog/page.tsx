import { getAllBlogPosts } from '@/utils/blog-utils';
import BlogListClient from '@/components/blog/blog-list-client';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.BlogPage',
    });

    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function BlogPage({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await paramsPromise;
    const posts = await getAllBlogPosts(locale);

    return (
        <BlogListClient
            posts={posts}
            locale={locale}
        />
    );
}
