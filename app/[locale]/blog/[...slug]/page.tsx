import { getBlogPost, getAllBlogPosts } from '@/utils/blog-utils';
import BlogPost from '@/components/blog/blog-post';
import { notFound } from 'next/navigation';

export async function generateStaticParams({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await paramsPromise;
    const posts = await getAllBlogPosts(locale);

    return posts.map((post) => ({
        slug: post.slug.split('/'),
    }));
}

export default async function BlogPostPage({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string; slug: string[] }>;
}) {
    const params = await paramsPromise;
    const { locale, slug } = params;

    // slug is an array like ['releases', 'post-name']
    if (!slug || slug.length !== 2) {
        notFound();
    }

    const [category, postSlug] = slug;
    const post = await getBlogPost(locale, category, postSlug);

    if (!post) {
        notFound();
    }

    return (
        <BlogPost
            title={post.title}
            date={post.date}
            category={post.category}
            content={post.content}
        />
    );
}
