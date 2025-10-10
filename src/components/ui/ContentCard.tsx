'use client'

import { Button } from './Button'
import { Play } from 'lucide-react'

interface ContentCardProps {
  image?: string | null
  title: string
  subtitle?: string | null
  badge?: string | null
  metaLeft?: string | null
  metaRight?: string | null
  progressPercent?: number
  actionLabel?: string
  onAction?: () => void
}

export function ContentCard({
  image,
  title,
  subtitle,
  badge,
  metaLeft,
  metaRight,
  progressPercent,
  actionLabel = 'Assistir',
  onAction,
}: ContentCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer w-[320px]">
      {image && (
        <div className="relative h-40">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          {badge && (
            <div className="absolute top-3 left-3 text-xs font-semibold bg-white/90 text-gray-900 rounded-full px-3 py-1">
              {badge}
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 line-clamp-2">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{subtitle}</p>
        )}

        {(metaLeft || metaRight) && (
          <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
            <span>{metaLeft}</span>
            <span>{metaRight}</span>
          </div>
        )}

        {typeof progressPercent === 'number' && progressPercent >= 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button fullWidth onClick={onAction}>
            <Play className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}


