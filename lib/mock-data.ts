import { MediaItem, Review, User } from './store';

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Alex Chen',
        email: 'alex.chen@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        bio: 'Film enthusiast and book lover',
        joinedAt: new Date('2023-01-15'),
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        bio: 'Gaming and music aficionado',
        joinedAt: new Date('2023-02-20'),
    },
];

export const mockMediaItems: MediaItem[] = [
    // Films
    {
        id: 'film-1',
        title: 'The Grand Budapest Hotel',
        type: 'film',
        year: 2014,
        director: 'Wes Anderson',
        genre: ['Comedy', 'Drama', 'Adventure'],
        poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
        description:
            'The adventures of Gustave H, a legendary concierge at a famous European hotel, and Zero Moustafa, the protégé who becomes his most trusted friend.',
        averageRating: 4.2,
        totalReviews: 1247,
    },
    {
        id: 'film-2',
        title: 'Parasite',
        type: 'film',
        year: 2019,
        director: 'Bong Joon-ho',
        genre: ['Thriller', 'Drama', 'Comedy'],
        poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        description:
            'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        averageRating: 4.5,
        totalReviews: 2103,
    },
    {
        id: 'film-3',
        title: 'Spirited Away',
        type: 'film',
        year: 2001,
        director: 'Hayao Miyazaki',
        genre: ['Animation', 'Family', 'Adventure'],
        poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
        description:
            "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
        averageRating: 4.7,
        totalReviews: 1895,
    },

    // Series
    {
        id: 'series-1',
        title: 'Breaking Bad',
        type: 'series',
        year: 2008,
        director: 'Vince Gilligan',
        genre: ['Crime', 'Drama', 'Thriller'],
        poster: 'https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
        description:
            'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
        averageRating: 4.8,
        totalReviews: 3241,
    },
    {
        id: 'series-2',
        title: 'The Bear',
        type: 'series',
        year: 2022,
        director: 'Christopher Storer',
        genre: ['Comedy', 'Drama'],
        poster: 'https://image.tmdb.org/t/p/w500/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg',
        description:
            'A young chef from the fine dining world comes home to Chicago to run his family sandwich shop.',
        averageRating: 4.4,
        totalReviews: 856,
    },

    // Games
    {
        id: 'game-1',
        title: 'The Legend of Zelda: Tears of the Kingdom',
        type: 'game',
        year: 2023,
        genre: ['Action', 'Adventure', 'RPG'],
        cover: 'https://pics.filmaffinity.com/The_Legend_of_Zelda_Tears_of_the_Kingdom-994717065-large.jpg',
        description:
            'An epic adventure across the land and skies of Hyrule awaits in The Legend of Zelda: Tears of the Kingdom.',
        averageRating: 4.6,
        totalReviews: 2847,
    },
    {
        id: 'game-2',
        title: 'Hades',
        type: 'game',
        year: 2020,
        genre: ['Action', 'Roguelike', 'Indie'],
        cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
        description:
            'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.',
        averageRating: 4.5,
        totalReviews: 1923,
    },

    // Books
    {
        id: 'book-1',
        title: 'Klara and the Sun',
        type: 'book',
        year: 2021,
        author: 'Kazuo Ishiguro',
        genre: ['Fiction', 'Science Fiction', 'Literary Fiction'],
        cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603206535i/54120408.jpg',
        description:
            'From her place in the store, Klara, an artificial friend with outstanding observational qualities, watches carefully.',
        averageRating: 4.1,
        totalReviews: 1456,
    },
    {
        id: 'book-2',
        title: 'Project Hail Mary',
        type: 'book',
        year: 2021,
        author: 'Andy Weir',
        genre: ['Science Fiction', 'Thriller', 'Adventure'],
        cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg',
        description:
            'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.',
        averageRating: 4.6,
        totalReviews: 2184,
    },

    // Music
    {
        id: 'music-1',
        title: 'Midnights',
        type: 'music',
        year: 2022,
        artist: 'Taylor Swift',
        genre: ['Pop', 'Alternative', 'Indie Pop'],
        cover: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png',
        description:
            'The stories of 13 sleepless nights scattered throughout my life.',
        averageRating: 4.3,
        totalReviews: 3421,
    },
    {
        id: 'music-2',
        title: 'Renaissance',
        type: 'music',
        year: 2022,
        artist: 'Beyoncé',
        genre: ['R&B', 'Dance', 'House'],
        cover: 'https://upload.wikimedia.org/wikipedia/en/a/ad/Beyonc%C3%A9_-_Renaissance.png',
        description:
            'A celebration of a club era when disco and house music was birthed from the minds of Black and LGBTQ+ pioneers.',
        averageRating: 4.5,
        totalReviews: 2156,
    },
];

export const mockReviews: Review[] = [
    {
        id: 'review-1',
        mediaId: 'film-1',
        userId: '1',
        rating: 4,
        review: 'Wes Anderson at his finest. The visual style is absolutely gorgeous and the performances are delightful.',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'review-2',
        mediaId: 'film-2',
        userId: '2',
        rating: 5,
        review: 'A masterpiece that perfectly captures class dynamics. Every frame is purposeful and the twist is incredible.',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
    },
    {
        id: 'review-3',
        mediaId: 'game-1',
        userId: '1',
        rating: 5,
        review: 'Nintendo has outdone themselves. The building mechanics add so much creativity to exploration.',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
    },
    {
        id: 'review-4',
        mediaId: 'book-1',
        userId: '2',
        rating: 4,
        review: "Ishiguro's prose is beautiful as always. A haunting meditation on love and consciousness.",
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
    },
];
