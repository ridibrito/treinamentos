'use client'

import { ReactNode, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ContentCarouselProps {
  title: string
  children: ReactNode
}

export function ContentCarousel({ title, children }: ContentCarouselProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const scroll = (dir: 'left' | 'right') => {
    const el = ref.current
    if (!el) return
    const amount = el.clientWidth * 0.9
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="overflow-x-auto no-scrollbar">
        <div className="grid grid-flow-col auto-cols-[320px] gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}


