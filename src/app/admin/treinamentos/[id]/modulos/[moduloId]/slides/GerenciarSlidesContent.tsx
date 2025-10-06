'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  GripVertical,
  Eye,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  Video
} from 'lucide-react'

interface GerenciarSlidesContentProps {
  profile: any
  modulo: any
  treinamentoId: string
}

interface Slide {
  id: string
  titulo: string
  conteudo: string
  imagem: string
  video_url: string
  tipo: 'texto' | 'imagem' | 'video' | 'markdown'
  ordem: number
  isNew?: boolean
}

export default function GerenciarSlidesContent({ 
  profile, 
  modulo, 
  treinamentoId 
}: GerenciarSlidesContentProps) {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  
  const [slides, setSlides] = useState<Slide[]>(
    modulo.slides?.map((s: any) => ({ ...s, isNew: false })) || []
  )
  const [salvando, setSalvando] = useState(false)
  const [slideExpandido, setSlideExpandido] = useState<string | null>(null)
  
  const handleAddSlide = () => {
    const novoSlide: Slide = {
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      titulo: '',
      conteudo: '',
      imagem: '',
      video_url: '',
      tipo: 'texto',
      ordem: slides.length + 1,
      isNew: true
    }
    setSlides([...slides, novoSlide])
    setSlideExpandido(novoSlide.id)
  }
  
  const handleRemoveSlide = async (id: string) => {
    const confirmado = await confirm({
      title: 'Remover Slide',
      message: 'Tem certeza que deseja remover este slide?',
      variant: 'danger'
    })
    
    if (confirmado) {
      setSlides(slides.filter(s => s.id !== id))
      toast.success('Slide removido!')
    }
  }
  
  const handleUpdateSlide = (id: string, field: string, value: any) => {
    setSlides(slides.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }
  
  const handleMoverSlide = (index: number, direcao: 'cima' | 'baixo') => {
    const novaOrdem = [...slides]
    if (direcao === 'cima' && index > 0) {
      [novaOrdem[index], novaOrdem[index - 1]] = [novaOrdem[index - 1], novaOrdem[index]]
    } else if (direcao === 'baixo' && index < slides.length - 1) {
      [novaOrdem[index], novaOrdem[index + 1]] = [novaOrdem[index + 1], novaOrdem[index]]
    }
    
    // Atualizar ordem
    const slidesReordenados = novaOrdem.map((s, i) => ({ ...s, ordem: i + 1 }))
    setSlides(slidesReordenados)
  }
  
  const handleSalvar = async () => {
    // Validações
    const slidesVazios = slides.filter(s => !s.titulo.trim() && !s.conteudo.trim())
    if (slidesVazios.length > 0) {
      toast.warning('Slides vazios', 'Preencha pelo menos o título ou conteúdo de todos os slides')
      return
    }
    
    setSalvando(true)
    
    try {
      const supabase = createClient()
      
      // Deletar slides antigos
      const slidesAntigos = slides.filter(s => !s.isNew).map(s => s.id)
      if (slidesAntigos.length > 0) {
        await supabase
          .from('slides')
          .delete()
          .in('id', slidesAntigos)
      }
      
      // Inserir todos os slides novamente (mais simples que update individual)
      const slidesParaInserir = slides.map(s => ({
        modulo_id: modulo.id,
        titulo: s.titulo || null,
        conteudo: s.conteudo || null,
        imagem: s.imagem || null,
        video_url: s.video_url || null,
        tipo: s.tipo,
        ordem: s.ordem
      }))
      
      const { error } = await supabase
        .from('slides')
        .insert(slidesParaInserir)
      
      if (error) throw error
      
      toast.success('Slides salvos!', `${slides.length} slides atualizados com sucesso`)
      
      setTimeout(() => {
        router.push(`/admin/treinamentos/${treinamentoId}/gerenciar`)
      }, 1500)
      
    } catch (error: any) {
      console.error('Erro ao salvar slides:', error)
      toast.error('Erro ao salvar', error.message)
    } finally {
      setSalvando(false)
    }
  }
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/admin/treinamentos/${treinamentoId}/gerenciar`)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para módulos</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Slides
          </h1>
          <p className="text-gray-600">
            Módulo: <span className="font-medium">{modulo.titulo}</span>
          </p>
        </div>
        
        {/* Adicionar Slide */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {slides.length} {slides.length === 1 ? 'slide' : 'slides'} criados
                </h2>
                <p className="text-sm text-gray-600">
                  Adicione, edite e organize os slides do módulo
                </p>
              </div>
              
              <Button onClick={handleAddSlide}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Slide
              </Button>
            </div>
          </CardBody>
        </Card>
        
        {/* Lista de Slides */}
        {slides.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Type className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhum slide adicionado ainda</p>
              <Button onClick={handleAddSlide}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Slide
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4 mb-6">
            {slides.map((slide, index) => (
              <Card key={slide.id} className="border-l-4 border-l-primary">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSlideExpandido(slideExpandido === slide.id ? null : slide.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-semibold text-primary">
                        Slide {index + 1}
                      </span>
                      <input
                        type="text"
                        value={slide.titulo}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleUpdateSlide(slide.id, 'titulo', e.target.value)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium"
                        placeholder="Título do slide"
                      />
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoverSlide(index, 'cima')
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoverSlide(index, 'baixo')
                          }}
                          disabled={index === slides.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveSlide(slide.id)
                          }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                          title="Remover slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {slideExpandido === slide.id && (
                  <CardBody className="p-6 border-t border-gray-200 space-y-4">
                    {/* Tipo de Slide */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Slide
                      </label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={slide.tipo === 'texto' ? 'primary' : 'secondary'}
                          onClick={() => handleUpdateSlide(slide.id, 'tipo', 'texto')}
                        >
                          <Type className="w-4 h-4 mr-1" />
                          Texto
                        </Button>
                        <Button
                          size="sm"
                          variant={slide.tipo === 'imagem' ? 'primary' : 'secondary'}
                          onClick={() => handleUpdateSlide(slide.id, 'tipo', 'imagem')}
                        >
                          <ImageIcon className="w-4 h-4 mr-1" />
                          Imagem
                        </Button>
                        <Button
                          size="sm"
                          variant={slide.tipo === 'video' ? 'primary' : 'secondary'}
                          onClick={() => handleUpdateSlide(slide.id, 'tipo', 'video')}
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Vídeo
                        </Button>
                      </div>
                    </div>
                    
                    {/* Conteúdo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conteúdo (HTML/Markdown)
                      </label>
                      <textarea
                        value={slide.conteudo}
                        onChange={(e) => handleUpdateSlide(slide.id, 'conteudo', e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                        placeholder="<h2>Título</h2>\n<p>Parágrafo...</p>\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Use HTML para formatação. Ex: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.
                      </p>
                    </div>
                    
                    {/* Imagem */}
                    {(slide.tipo === 'imagem' || slide.tipo === 'texto') && (
                      <div>
                        <Input
                          label="URL da Imagem (opcional)"
                          value={slide.imagem}
                          onChange={(e) => handleUpdateSlide(slide.id, 'imagem', e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                    )}
                    
                    {/* Vídeo */}
                    {slide.tipo === 'video' && (
                      <div>
                        <Input
                          label="URL do Vídeo (YouTube/Vimeo)"
                          value={slide.video_url}
                          onChange={(e) => handleUpdateSlide(slide.id, 'video_url', e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    )}
                    
                    {/* Preview */}
                    {slide.conteudo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview
                        </label>
                        <div className="border border-gray-300 rounded-lg p-6 bg-white">
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: slide.conteudo }}
                          />
                        </div>
                      </div>
                    )}
                  </CardBody>
                )}
              </Card>
            ))}
          </div>
        )}
        
        {/* Ações */}
        <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-8 px-8">
          <Button
            variant="secondary"
            onClick={() => router.push(`/admin/treinamentos/${treinamentoId}/gerenciar`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
            </span>
            
            <Button
              onClick={handleSalvar}
              disabled={salvando || slides.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {salvando ? 'Salvando...' : 'Salvar Slides'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

