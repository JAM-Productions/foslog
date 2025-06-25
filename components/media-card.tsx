'use client'

import { Star, Eye, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MediaItem } from '@/lib/store'
import { cn } from '@/lib/utils'

interface MediaCardProps {
  media: MediaItem
  className?: string
}

const getMediaIcon = (type: MediaItem['type']) => {
  switch (type) {
    case 'film': return '🎬'
    case 'series': return '📺'
    case 'game': return '🎮'
    case 'book': return '📚'
    case 'music': return '🎵'
    default: return '📄'
  }
}

const getCreatorLabel = (media: MediaItem) => {
  if (media.director) return `Dir. ${media.director}`
  if (media.author) return `by ${media.author}`
  if (media.artist) return media.artist
  return ''
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating)
    const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5

    return (
      <div key={i} className="relative">
        <Star
          className={cn(
            "text-muted-foreground",
            size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
          )}
        />
        {(filled || halfFilled) && (
          <Star
            className={cn(
              "absolute top-0 left-0 text-amber-400 fill-amber-400",
              size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
              halfFilled && 'w-1/2 overflow-hidden'
            )}
          />
        )}
      </div>
    )
  })

  return <div className="flex items-center gap-0.5">{stars}</div>
}

export default function MediaCard({ media, className }: MediaCardProps) {
  const imageUrl = media.poster || media.cover
  const creatorLabel = getCreatorLabel(media)

  return (
    <Card className={cn("group cursor-pointer transition-all hover:shadow-lg", className)}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={media.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
              {getMediaIcon(media.type)}
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-xs font-medium">
            <span className="mr-1">{getMediaIcon(media.type)}</span>
            {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
          </div>

          {/* Year Badge */}
          {media.year && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-xs font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {media.year}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-semibold text-sm leading-tight line-clamp-2" title={media.title}>
              {media.title}
            </h3>

            {/* Creator */}
            {creatorLabel && (
              <p className="text-xs text-muted-foreground line-clamp-1" title={creatorLabel}>
                {creatorLabel}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-1">
              {media.genre.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                >
                  {genre}
                </span>
              ))}
              {media.genre.length > 2 && (
                <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                  +{media.genre.length - 2}
                </span>
              )}
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                <StarRating rating={media.averageRating} />
                <span className="text-xs text-muted-foreground ml-1">
                  {media.averageRating.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                {media.totalReviews.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
