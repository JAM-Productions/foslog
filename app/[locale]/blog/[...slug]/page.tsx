import { getBlogPost, getAllBlogPosts } from '@/utils/blog-utils';
import BlogPost from '@/components/blog/blog-post';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.BlogPostPage',
    });

    if (!slug || slug.length !== 2) {
        return {
            title: t('postNotFound'),
        };
    }

    const [category, postSlug] = slug;
    const post = await getBlogPost(locale, category, postSlug);

    if (!post) {
        return {
            title: t('postNotFound'),
        };
    }

    return {
        title: t('postTitle', { title: post.title }),
        description: t('postDescription', { description: post.description }),
    };
}

export async function generateStaticParams({
    params,
}: {
    params: { locale: string };
}) {
    const posts = await getAllBlogPosts(params.locale);

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
