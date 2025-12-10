import { getMedias } from '@/app/actions/media';
import HomePageClient from './home-page-client';

import { headers } from 'next/headers';

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            userAgent
        );
    const pageSize = isMobile ? 8 : 12;

    const { items, total } = await getMedias(page, pageSize);

    return (
        <HomePageClient
            mediaItems={items}
            total={total}
            currentPage={page}
            pageSize={pageSize}
        />
    );
}
