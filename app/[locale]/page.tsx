import { getMedias } from '@/app/actions/media';
import HomePageClient from './home-page-client';

export default async function HomePage() {
    const mediaItems = await getMedias();
    return <HomePageClient mediaItems={mediaItems} />;
}
