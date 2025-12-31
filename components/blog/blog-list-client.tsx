'use client';

import { useState } from 'react';
import BlogCard from '@/components/blog/blog-card';
import BlogCategoryFilter from '@/components/blog/blog-category-filter';
import { BlogPostMetadata } from '@/utils/blog-utils';
import { useTranslations } from 'next-intl';

interface BlogListClientProps {
    posts: BlogPostMetadata[];
    locale: string;
}

export default function BlogListClient({ posts, locale }: BlogListClientProps) {
    const [activeCategory, setActiveCategory] = useState('all');
    const t = useTranslations('BlogPage');

    // Client-side filtering for instant category switching without re-fetching
    // This provides better UX than server-side filtering which would require page reloads
    const filteredPosts =
        activeCategory === 'all'
            ? posts
            : posts.filter((post) => post.category === activeCategory);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-8 text-4xl font-bold">{t('title')}</h1>

            <BlogCategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            {filteredPosts.length === 0 ? (
                <p className="text-muted-foreground text-center">
                    {t('noPosts')}
                </p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                        <BlogCard
                            key={post.slug}
                            {...post}
                            locale={locale}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
