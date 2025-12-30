
import { promises as fs } from 'fs';
import path from 'path';
import BlogPage from './blog-page';
import { getTranslator } from 'next-intl/server';

type Post = {
    category: string;
    title: string;
    content: string;
};

async function getBlogPosts(locale: string): Promise<Post[]> {
    const filePath = path.join(process.cwd(), '_blog', locale, 'blog.json');
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const blogData = JSON.parse(fileContent);
        return blogData.posts || [];
    } catch (error) {
        console.error(`Could not read or parse blog.json for locale: ${locale}`, error);
        return [];
    }
}

export default async function BlogPageWrapper({
    params,
}: {
    params: { locale: string };
}) {
    const t = await getTranslator(params.locale, 'BlogPage');
    const posts = await getBlogPosts(params.locale);

    return (
        <BlogPage
            posts={posts}
            allCategories={t('allCategories')}
        />
    );
}
