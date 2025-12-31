import Link from 'next/link';

interface BlogCardProps {
    slug: string;
    title: string;
    date: string;
    category: string;
    description: string;
    locale: string;
}

export default function BlogCard({
    slug,
    title,
    date,
    category,
    description,
    locale,
}: BlogCardProps) {
    return (
        <Link
            href={`/${locale}/blog/${slug}`}
            className="group border-border bg-card hover:border-primary/50 block rounded-lg border p-6 transition-all hover:shadow-md"
        >
            <div className="mb-2 flex items-center gap-2 text-sm">
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {category}
                </span>
                <time
                    dateTime={date}
                    className="text-muted-foreground"
                >
                    {new Date(date).toLocaleDateString()}
                </time>
            </div>

            <h2 className="group-hover:text-primary mb-2 text-xl font-semibold">
                {title}
            </h2>

            <p className="text-muted-foreground line-clamp-3 text-sm">
                {description}
            </p>
        </Link>
    );
}
