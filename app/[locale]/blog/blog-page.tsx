
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Post = {
    category: string;
    title: string;
    content: string;
};

type BlogPageProps = {
    posts: Post[];
    allCategories: string;
};

export default function BlogPage({ posts, allCategories }: BlogPageProps) {
    const [filter, setFilter] = useState<string>('all');

    const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category)))];

    const filteredPosts =
        filter === 'all'
            ? posts
            : posts.filter((post) => post.category === filter);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-8 flex justify-center space-x-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            filter === category
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {category === 'all' ? allCategories : category}
                    </button>
                ))}
            </div>

            <div className="space-y-8">
                {filteredPosts.map((post, index) => (
                    <div
                        key={index}
                        className="rounded-lg border bg-card p-6 text-card-foreground"
                    >
                        <h2 className="mb-2 text-2xl font-semibold">
                            {post.title}
                        </h2>
                        <ReactMarkdown
                            components={{
                                img: ({ ...props }) => (
                                    <img
                                        className="mx-auto my-4 max-w-full rounded-lg"
                                        {...props}
                                    />
                                ),
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>
                ))}
            </div>
        </div>
    );
}
