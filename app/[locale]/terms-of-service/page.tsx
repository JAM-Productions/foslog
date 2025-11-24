import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default async function TermsOfServicePage({ params: paramsPromise }: { params: Promise<{ locale: string }> }) {
    const params = await paramsPromise;
    const filePath = path.join(process.cwd(), '_legal', params.locale, 'terms-of-service.md');
    const markdown = await fs.readFile(filePath, 'utf-8');

    return (
        <div className="container mx-auto px-4 py-8 prose prose-lg dark:prose-invert max-w-4xl">
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    );
}
