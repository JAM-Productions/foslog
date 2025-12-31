import { getAllBlogPosts } from '@/utils/blog-utils';
import BlogListClient from '@/components/blog/blog-list-client';

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
