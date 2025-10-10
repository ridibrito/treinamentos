'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getEmbedUrl, getVideoPlatform } from '@/lib/video-utils'
import { 
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize,
  CheckCircle,
  FileText,
  Clock,
  Video
} from 'lucide-react'

interface ModuloContentProps {
  profile: any
  modulo: any
  teste: any
  progresso: any
}

export function ModuloContent({ 
  profile, 
  modulo, 
  teste,
  progresso
}: ModuloContentProps) {
  const router = useRouter()
  const [slideAtual, setSlideAtual] = useState(0)
  const [marcandoConcluido, setMarcandoConcluido] = useState(false)
  const playerRef = useRef<any>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const progressTimer = useRef<NodeJS.Timeout | null>(null)
  const progressoIdRef = useRef<string | null>(progresso?.id || null)
  
  const slides = modulo.slides || []
  const totalSlides = slides.length
  
  const handleProximo = () => {
    if (slideAtual < totalSlides - 1) {
      setSlideAtual(slideAtual + 1)
    }
  }
  
  const handleAnterior = () => {
    if (slideAtual > 0) {
      setSlideAtual(slideAtual - 1)
    }
  }
  
  const persistirProgresso = async (percentual: number, currentSeconds: number, durationSeconds: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    try {
      if (progressoIdRef.current) {
        await supabase
          .from('progresso_treinamento')
          .update({ 
            progresso_percentual: percentual,
            video_segundos: currentSeconds,
            video_duracao_segundos: durationSeconds
          })
          .eq('id', progressoIdRef.current)
      } else {
        const { data: inserted } = await supabase
          .from('progresso_treinamento')
          .insert({
            user_id: user.id,
            treinamento_id: modulo.treinamento_id,
            modulo_id: modulo.id,
            concluido: false,
            progresso_percentual: percentual,
            video_segundos: currentSeconds,
            video_duracao_segundos: durationSeconds
          })
          .select('id')
          .single()
        if (inserted?.id) {
          progressoIdRef.current = inserted.id
        }
      }
    } catch (e) {
      console.error('Falha ao salvar progresso:', e)
    }
  }
  
  // Tracking do YouTube via IFrame API
  useEffect(() => {
    if (!modulo.video_url || getVideoPlatform(modulo.video_url) !== 'youtube') return
    
    // Carrega a API se necessário
    function ensureYT(onReady: () => void) {
      // @ts-ignore
      if (window.YT && window.YT.Player) return onReady()
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
      // @ts-ignore
      ;(window as any).onYouTubeIframeAPIReady = () => onReady()
    }
    
    ensureYT(() => {
      // @ts-ignore
      const YT = window.YT
      playerRef.current = new YT.Player(iframeRef.current, {
        events: {
          onReady: async () => {
            // Retomar posição salva, se existir
            const seg = Number(progresso?.video_segundos || 0)
            const dur = Number(progresso?.video_duracao_segundos || 0)
            if (seg > 0 && dur > 0) {
              try {
                // Tenta algumas vezes pois o player pode não aceitar imediatamente
                let attempts = 0
                const trySeek = () => {
                  try {
                    attempts++
                    playerRef.current.seekTo(seg, true)
                    // Opcional: pausar para mostrar a posição correta
                    playerRef.current.pauseVideo?.()
                  } catch {}
                  if (attempts < 3) setTimeout(trySeek, 300)
                }
                trySeek()
              } catch {}
            }
          },
          onStateChange: async (event: any) => {
            // Inicia timer de progresso quando estiver tocando
            if (event.data === YT.PlayerState.PLAYING) {
              if (progressTimer.current) clearInterval(progressTimer.current)
              const tick = async () => {
                try {
                  const duration = playerRef.current.getDuration() || 0
                  const current = playerRef.current.getCurrentTime() || 0
                  if (duration > 0) {
                    const percent = Math.min(100, Math.round((current / duration) * 100))
                    await persistirProgresso(percent, current, duration)
                    // Concluir automaticamente ao >= 90%
                    if (percent >= 90 && !progresso?.concluido) {
                      await handleMarcarConcluido(true)
                    }
                  }
                } catch {}
              }
              progressTimer.current = setInterval(tick, 5000) // a cada 5s
              // Executa um tick imediato ao começar
              await tick()
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              if (progressTimer.current) {
                clearInterval(progressTimer.current)
                progressTimer.current = null
              }
              // Salva um último tick ao pausar/terminar
              try {
                const duration = playerRef.current.getDuration() || 0
                const current = playerRef.current.getCurrentTime() || 0
                if (duration > 0) {
                  const percent = Math.min(100, Math.round((current / duration) * 100))
                  await persistirProgresso(percent, current, duration)
                }
              } catch {}
              if (event.data === YT.PlayerState.ENDED && !progresso?.concluido) {
                await handleMarcarConcluido(true)
              }
            }
          }
        }
      })
    })
    
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo.video_url])

  // Salvar progresso ao ocultar a aba
  useEffect(() => {
    const onVisibility = async () => {
      if (document.hidden || !playerRef.current) {
        try {
          const duration = playerRef.current.getDuration() || 0
          const current = playerRef.current.getCurrentTime() || 0
          if (duration > 0) {
            const percent = Math.min(100, Math.round((current / duration) * 100))
            await persistirProgresso(percent, current, duration)
          }
        } catch {}
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleMarcarConcluido = async (auto = false) => {
    setMarcandoConcluido(!auto)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      if (progressoIdRef.current) {
        await supabase
          .from('progresso_treinamento')
          .update({ 
            concluido: true,
            data_conclusao: new Date().toISOString(),
            progresso_percentual: 100
          })
          .eq('id', progressoIdRef.current)
      } else {
        const { data: inserted } = await supabase
          .from('progresso_treinamento')
          .insert({
            user_id: user.id,
            treinamento_id: modulo.treinamento_id,
            modulo_id: modulo.id,
            concluido: true,
            data_conclusao: new Date().toISOString(),
            progresso_percentual: 100
          })
          .select('id')
          .single()
        if (inserted?.id) {
          progressoIdRef.current = inserted.id
        }
      }
      
      if (!auto) {
        // Se tem teste, redirecionar para o teste; senão volta ao treinamento
        if (teste) {
          router.push(`/treinamentos/${modulo.treinamento_id}/modulos/${modulo.id}/teste`)
        } else {
          router.push(`/treinamentos/${modulo.treinamento_id}`)
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error)
    } finally {
      setMarcandoConcluido(false)
    }
  }
  
  const slideData = slides[slideAtual]
  const isConcluido = progresso?.concluido
  const progressoPercentual = progresso?.progresso_percentual ?? 0
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        {/* Navegação */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push(`/treinamentos/${modulo.treinamento_id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Treinamento</span>
          </button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/treinamentos/${modulo.treinamento_id}/modulos/${modulo.id}/apresentacao`)}
          >
            <Maximize className="w-4 h-4 mr-2" />
            Modo Apresentação
          </Button>
        </div>
        
        {/* Cabeçalho do Módulo */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  {modulo.treinamentos?.titulo}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {modulo.titulo}
                </h1>
                {modulo.descricao && (
                  <p className="text-gray-600 mb-4">{modulo.descricao}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4">
                  {modulo.duracao && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{modulo.duracao}</span>
                    </div>
                  )}
                  {isConcluido && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Módulo concluído</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Vídeo Principal do Módulo (se tiver) */}
        {modulo.video_url && (
          <Card className="mb-6">
            <CardBody className="p-8">
              <div className="flex items-center space-x-2 mb-4">
                <Video className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">
                  Vídeo-aula Principal
                </h2>
              </div>
              
              {/* Barra de progresso do vídeo */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progressoPercentual}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Assistido: {Math.round(progressoPercentual)}%</p>
              </div>
              
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                <iframe
                  ref={iframeRef}
                  src={getEmbedUrl(modulo.video_url)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={modulo.titulo}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Conteúdo em Texto (se tiver) */}
        {modulo.conteudo && !modulo.video_url && totalSlides === 0 && (
          <Card className="mb-6">
            <CardBody className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: modulo.conteudo }}
              />
            </CardBody>
          </Card>
        )}

        {/* Conteúdo do Slide */}
        {totalSlides > 0 ? (
          <>
            <Card className="mb-6">
              <CardBody className="p-8 min-h-[500px]">
                {slideData.titulo && (
                  <h2 className="text-2xl font-bold text-primary mb-6">
                    {slideData.titulo}
                  </h2>
                )}
                
                {slideData.imagem && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={slideData.imagem}
                      alt={slideData.titulo || 'Slide'}
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                )}
                
                {slideData.video_url && (
                  <div className="mb-6 aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={slideData.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      title={slideData.titulo || 'Vídeo'}
                    />
                  </div>
                )}
                
                {slideData.conteudo && (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: slideData.conteudo }}
                  />
                )}
              </CardBody>
            </Card>
            
            {/* Navegação entre slides */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleAnterior}
                disabled={slideAtual === 0}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Anterior
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Slide {slideAtual + 1} de {totalSlides}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {slides.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSlideAtual(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === slideAtual 
                          ? 'bg-primary w-8' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {slideAtual === totalSlides - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => handleMarcarConcluido(false)}
                  disabled={marcandoConcluido}
                >
                  {marcandoConcluido ? 'Salvando...' : (
                    <>
                      {teste ? 'Fazer Teste' : 'Concluir Módulo'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleProximo}
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </>
        ) : null}

        {/* Botão de Concluir (se não tem slides ou já está no final) */}
        {(totalSlides === 0 && (modulo.video_url || modulo.conteudo)) && (
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Assistiu ao vídeo completo?
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleMarcarConcluido(false)}
                  disabled={marcandoConcluido}
                >
                  {marcandoConcluido ? 'Salvando...' : (
                    <>
                      {teste ? 'Concluir e Fazer Teste' : 'Marcar como Concluído'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Caso não tenha nenhum conteúdo */}
        {totalSlides === 0 && !modulo.video_url && !modulo.conteudo && (
          <Card>
            <CardBody className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">Este módulo ainda não possui conteúdo</p>
              
              <Button
                variant="primary"
                onClick={() => handleMarcarConcluido(false)}
                disabled={marcandoConcluido}
              >
                {marcandoConcluido ? 'Salvando...' : 'Marcar como Concluído'}
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

