'use client'

import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { mockMediaItems, mockReviews, mockUsers } from '@/lib/mock-data'
import MediaCard from '@/components/media-card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Clock, Star } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const {
    mediaItems,
    setMediaItems,
    setReviews,
    selectedMediaType,
    searchQuery,
    user,
    setUser
  } = useAppStore()

  // Initialize with mock data
  useEffect(() => {
    if (mediaItems.length === 0) {
      setMediaItems(mockMediaItems)
      setReviews(mockReviews)
      // For demo purposes, set a mock user
      setUser(mockUsers[0])
    }
  }, [mediaItems.length, setMediaItems, setReviews, setUser])

  // Filter and search media items
  const filteredMedia = useMemo(() => {
    let filtered = mediaItems

    // Filter by media type
    if (selectedMediaType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedMediaType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.genre.some(g => g.toLowerCase().includes(query)) ||
        item.director?.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query) ||
        item.artist?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [mediaItems, selectedMediaType, searchQuery])

  // Sort options
  const sortedMedia = useMemo(() => {
    return [...filteredMedia].sort((a, b) => {
      // Default sort by average rating (highest first), then by total reviews
      if (a.averageRating !== b.averageRating) {
        return b.averageRating - a.averageRating
      }
      return b.totalReviews - a.totalReviews
    })
  }, [filteredMedia])

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'film': return 'Films'
      case 'series': return 'Series'
      case 'game': return 'Games'
      case 'book': return 'Books'
      case 'music': return 'Music'
      default: return 'All Media'
    }
  }

  const SectionHeader = ({ title, subtitle, icon: Icon }: {
    title: string;
    subtitle: string;
    icon: any;
  }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Image
              src="/favicon.svg"
              alt="Foslog"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Foslog
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your personal media review journal. Track and review films, series, books, games, and music all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Discover and review your next favorite {selectedMediaType === 'all' ? 'media' : getTypeDisplayName(selectedMediaType).toLowerCase()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Top Rated</span>
          </div>
          <p className="text-2xl font-bold">{filteredMedia.length > 0 ? Math.max(...filteredMedia.map(m => m.averageRating)).toFixed(1) : '0'}</p>
          <p className="text-xs text-muted-foreground">Highest rated in collection</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Total Items</span>
          </div>
          <p className="text-2xl font-bold">{filteredMedia.length}</p>
          <p className="text-xs text-muted-foreground">
            {selectedMediaType === 'all' ? 'All media types' : getTypeDisplayName(selectedMediaType)}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Recently Added</span>
          </div>
          <p className="text-2xl font-bold">
            {sortedMedia.filter(m => m.year && m.year >= 2023).length}
          </p>
          <p className="text-xs text-muted-foreground">From 2023 onwards</p>
        </div>
      </div>

      {/* Media Grid Section */}
      <div className="mb-8">
        <SectionHeader
          title={searchQuery ? 'Search Results' : `Trending ${getTypeDisplayName(selectedMediaType)}`}
          subtitle={
            searchQuery
              ? `${sortedMedia.length} results for "${searchQuery}"`
              : `Popular ${selectedMediaType === 'all' ? 'media' : getTypeDisplayName(selectedMediaType).toLowerCase()} with great reviews`
          }
          icon={searchQuery ? TrendingUp : Star}
        />

        {sortedMedia.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No ${selectedMediaType === 'all' ? 'media' : getTypeDisplayName(selectedMediaType).toLowerCase()} found matching "${searchQuery}"`
                : `No ${selectedMediaType === 'all' ? 'media' : getTypeDisplayName(selectedMediaType).toLowerCase()} available`
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => useAppStore.getState().setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedMedia.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        )}
      </div>

      {/* Add CTA for more content */}
      {sortedMedia.length > 0 && (
        <div className="text-center py-8 border-t">
          <h3 className="text-lg font-semibold mb-2">Want to add your own reviews?</h3>
          <p className="text-muted-foreground mb-4">
            Start building your personal media collection and share your thoughts
          </p>
          <Button>Add New Review</Button>
        </div>
      )}
    </div>
  )
}
