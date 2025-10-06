'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getEmbedUrl } from '@/lib/video-utils'
import { 
  ChevronLeft,
  ChevronRight,
  X,
  Maximize,
  Minimize
} from 'lucide-react'

interface ApresentacaoContentProps {
  modulo: any
}

export function ApresentacaoContent({ modulo }: ApresentacaoContentProps) {
  const router = useRouter()
  const [slideAtual, setSlideAtual] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  
  const slides = modulo.slides || []
  const totalSlides = slides.length
  
  const handleProximo = useCallback(() => {
    if (slideAtual < totalSlides - 1) {
      setSlideAtual(slideAtual + 1)
    }
  }, [slideAtual, totalSlides])
  
  const handleAnterior = useCallback(() => {
    if (slideAtual > 0) {
      setSlideAtual(slideAtual - 1)
    }
  }, [slideAtual])
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }
  
  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleProximo()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleAnterior()
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
          setFullscreen(false)
        } else {
          router.back()
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleProximo, handleAnterior, router])
  
  // Detectar mudança de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  if (totalSlides === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nenhum slide disponível</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }
  
  const slideData = slides[slideAtual]
  
  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Controles Superiores */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{modulo.titulo}</h2>
            <p className="text-sm text-gray-300">{modulo.treinamentos?.titulo}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={fullscreen ? 'Sair do modo tela cheia (F)' : 'Modo tela cheia (F)'}
            >
              {fullscreen ? (
                <Minimize className="w-6 h-6" />
              ) : (
                <Maximize className="w-6 h-6" />
              )}
            </button>
            
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Sair (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Conteúdo do Slide */}
      <div className="min-h-screen flex items-center justify-center p-16 pt-24 pb-20">
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-xl p-12 text-gray-900 shadow-2xl min-h-[600px] flex flex-col">
            {slideData.titulo && (
              <h1 className="text-5xl font-bold text-primary mb-8">
                {slideData.titulo}
              </h1>
            )}
            
            <div className="flex-1 flex flex-col justify-center">
              {slideData.imagem && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img
                    src={slideData.imagem}
                    alt={slideData.titulo || 'Slide'}
                    className="w-full max-h-[400px] object-contain mx-auto"
                  />
                </div>
              )}
              
              {slideData.video_url && (
                <div className="mb-8 aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={getEmbedUrl(slideData.video_url)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={slideData.titulo || 'Vídeo'}
                  />
                </div>
              )}
              
              {slideData.conteudo && (
                <div 
                  className="prose prose-xl max-w-none"
                  dangerouslySetInnerHTML={{ __html: slideData.conteudo }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navegação e Contador */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={handleAnterior}
            disabled={slideAtual === 0}
            className="p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Anterior (←)"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="text-center">
            <p className="text-lg font-medium mb-3">
              {slideAtual + 1} / {totalSlides}
            </p>
            <div className="flex items-center space-x-2">
              {slides.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSlideAtual(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === slideAtual 
                      ? 'bg-white w-12' 
                      : 'bg-white/30 w-2 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={handleProximo}
            disabled={slideAtual === totalSlides - 1}
            className="p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Próximo (→ ou Espaço)"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-4">
          Use as setas do teclado ou clique nos botões para navegar • F para tela cheia • ESC para sair
        </p>
      </div>
    </div>
  )
}

