'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { 
  ArrowLeft,
  Edit,
  FileText,
  ClipboardList,
  Presentation,
  Video,
  CheckCircle,
  XCircle,
  MoreVertical,
  GripVertical,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

interface GerenciarTreinamentoContentProps {
  profile: any
  treinamento: any
}

export default function GerenciarTreinamentoContent({ 
  profile, 
  treinamento 
}: GerenciarTreinamentoContentProps) {
  const router = useRouter()
  const toast = useToast()
  const { confirm } = useConfirm()
  const [addOpen, setAddOpen] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoDescricao, setNovoDescricao] = useState('')
  const [novoTipo, setNovoTipo] = useState<'slides' | 'video' | 'texto'>('slides')
  const [novoVideoUrl, setNovoVideoUrl] = useState('')
  const [novoConteudo, setNovoConteudo] = useState('')
  const [salvandoModulo, setSalvandoModulo] = useState(false)
  const [editOpen, setEditOpen] = useState<null | { id: string }>(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [editVideoUrl, setEditVideoUrl] = useState('')
  const [editConteudo, setEditConteudo] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [modulos, setModulos] = useState<any[]>(treinamento.modulos || [])
  const [dragId, setDragId] = useState<string | null>(null)
  const [salvandoOrdem, setSalvandoOrdem] = useState(false)
  const [dragSlide, setDragSlide] = useState<{ moduloId: string; slideId: string } | null>(null)
  const [salvandoOrdemAulas, setSalvandoOrdemAulas] = useState(false)

  const onDragStart = (id: string) => setDragId(id)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = async (overId: string) => {
    if (!dragId || dragId === overId) return
    const current = [...modulos]
    const fromIdx = current.findIndex(m => m.id === dragId)
    const toIdx = current.findIndex(m => m.id === overId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = current.splice(fromIdx, 1)
    current.splice(toIdx, 0, moved)
    // recalcular ordem
    const updated = current.map((m, i) => ({ ...m, ordem: i + 1 }))
    setModulos(updated)
    setDragId(null)
    // persistir
    try {
      setSalvandoOrdem(true)
      const supabase = createClient()
      await Promise.all(
        updated.map((m) => supabase.from('modulos').update({ ordem: m.ordem }).eq('id', m.id))
      )
      toast.success('Ordem atualizada!', 'Módulos reordenados')
      router.refresh()
    } catch (e: any) {
      console.error(e)
      toast.error('Erro ao salvar ordem', e.message || 'Tente novamente')
    } finally {
      setSalvandoOrdem(false)
    }
  }

  const onSlideDragStart = (moduloId: string, slideId: string) => setDragSlide({ moduloId, slideId })
  const onSlideDrop = async (moduloId: string, overSlideId: string) => {
    if (!dragSlide || dragSlide.moduloId !== moduloId || dragSlide.slideId === overSlideId) return
    const current = [...modulos]
    const mIdx = current.findIndex(m => m.id === moduloId)
    if (mIdx === -1) return
    const slides = Array.isArray(current[mIdx].slides) ? [...current[mIdx].slides] : []
    const fromIdx = slides.findIndex((s: any) => s.id === dragSlide.slideId)
    const toIdx = slides.findIndex((s: any) => s.id === overSlideId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = slides.splice(fromIdx, 1)
    slides.splice(toIdx, 0, moved)
    const updatedSlides = slides.map((s: any, i: number) => ({ ...s, ordem: i + 1 }))
    current[mIdx] = { ...current[mIdx], slides: updatedSlides }
    setModulos(current)
    setDragSlide(null)
    // persistir
    try {
      setSalvandoOrdemAulas(true)
      const supabase = createClient()
      await Promise.all(
        updatedSlides.map((s: any) => supabase.from('slides').update({ ordem: s.ordem }).eq('id', s.id))
      )
      toast.success('Ordem das aulas atualizada!', 'Reordenação salva')
      router.refresh()
    } catch (e: any) {
      console.error(e)
      toast.error('Erro ao salvar ordem das aulas', e.message || 'Tente novamente')
    } finally {
      setSalvandoOrdemAulas(false)
    }
  }
  
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/treinamentos')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para treinamentos</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {treinamento.titulo}
              </h1>
              <p className="text-gray-600">
                Gerenciar módulos, slides e testes
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push(`/admin/treinamentos/${treinamento.id}/editar`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Dados
              </Button>
              
              <Button
                onClick={() => router.push(`/admin/treinamentos/${treinamento.id}/apostila`)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Apostila
              </Button>
            </div>
          </div>
        </div>
        
        {/* Info do Treinamento */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Categoria</p>
                <p className="font-medium text-gray-900">{treinamento.categoria || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Duração</p>
                <p className="font-medium text-gray-900">{treinamento.duracao || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo de Conteúdo</p>
                <p className="font-medium text-gray-900 capitalize">{treinamento.tipo_conteudo || 'slides'}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        {/* Manual de Vendas: visível apenas na listagem geral (AdminTreinamentosContent) */}

        {/* Módulos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Módulos ({treinamento.modulos?.length || 0})
            </h2>
            <Button size="sm" onClick={() => setAddOpen(true)}>+ Adicionar Módulo</Button>
          </div>
          
          {modulos?.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <p className="text-gray-600 mb-4">Nenhum módulo cadastrado</p>
                <p className="text-sm text-gray-500">
                  Edite o treinamento para adicionar módulos
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {modulos?.map((modulo: any, index: number) => {
                const slidesCount = Array.isArray(modulo.slides) ? modulo.slides.length : (modulo.slides?.[0]?.count || 0)
                const temTeste = modulo.testes && modulo.testes.length > 0
                
                return (
                  <Card
                    key={modulo.id}
                    className="border-l-4 border-l-primary"
                    draggable
                    onDragStart={() => onDragStart(modulo.id)}
                    onDragOver={onDragOver}
                    onDrop={() => onDrop(modulo.id)}
                  >
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                              Módulo {index + 1}
                            </span>
                            {modulo.video_url && (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                Vídeo
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {modulo.titulo}
                          </h3>
                          
                          {modulo.descricao && (
                            <p className="text-gray-600 text-sm mb-3">
                              {modulo.descricao}
                            </p>
                          )}
                          
                          {/* Status */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {slidesCount > 0 ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-gray-700">{slidesCount} slides</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-500">Sem slides</span>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {temTeste ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-gray-700">Teste configurado</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-500">Sem teste</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ações - menu 3 dots */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <details className="ml-auto relative">
                          <summary className="list-none cursor-pointer p-2 hover:bg-gray-100 rounded inline-flex items-center">
                            <MoreVertical className="w-5 h-5" />
                          </summary>
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-2">
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => router.push(`/admin/treinamentos/${treinamento.id}/modulos/${modulo.id}/slides`)}>
                              <Presentation className="w-4 h-4" /> Gerenciar aulas
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => {
                              setEditOpen({ id: modulo.id })
                              setEditTitulo(modulo.titulo || '')
                              setEditDescricao(modulo.descricao || '')
                              setEditVideoUrl(modulo.video_url || '')
                              setEditConteudo(modulo.conteudo || '')
                            }}>
                              <Edit className="w-4 h-4" /> Editar módulo
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={async () => {
                              const confirmado = await confirm({ title: 'Excluir Módulo', message: 'Tem certeza? As aulas e testes serão removidos.', variant: 'danger' })
                              if (!confirmado) return
                              const supabase = createClient()
                              const { error } = await supabase.from('modulos').delete().eq('id', modulo.id)
                              if (error) { toast.error('Erro ao excluir', error.message); return }
                              toast.success('Módulo excluído!', 'Removido com sucesso')
                              router.refresh()
                            }}>
                              <XCircle className="w-4 h-4" /> Excluir
                            </button>
                          </div>
                        </details>
                      </div>

                      {/* Acordeão de Aulas */}
                      <div className="mt-4">
                        <details>
                          <summary className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <ChevronDown className="w-4 h-4" /> Aulas do módulo ({slidesCount})
                          </summary>
                          <div className="mt-4 space-y-2">
                            {Array.isArray(modulo.slides) && modulo.slides.sort((a: any, b: any) => a.ordem - b.ordem).map((s: any, idx: number) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between px-3 py-2 border rounded-lg bg-gray-50"
                                draggable
                                onDragStart={() => onSlideDragStart(modulo.id, s.id)}
                                onDragOver={onDragOver}
                                onDrop={() => onSlideDrop(modulo.id, s.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium">{idx + 1}. {s.titulo || 'Sem título'}</span>
                                </div>
                                <details className="relative">
                                  <summary className="list-none cursor-pointer p-1 hover:bg-gray-100 rounded inline-flex items-center">
                                    <MoreVertical className="w-4 h-4" />
                                  </summary>
                                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-2">
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => router.push(`/admin/treinamentos/${treinamento.id}/modulos/${modulo.id}/slides`)}>
                                      Editar aula
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={async () => {
                                      const confirmado = await confirm({ title: 'Excluir Aula', message: 'Excluir esta aula?', variant: 'danger' })
                                      if (!confirmado) return
                                      const supabase = createClient()
                                      const { error } = await supabase.from('slides').delete().eq('id', s.id)
                                      if (error) { toast.error('Erro ao excluir aula', error.message); return }
                                      toast.success('Aula excluída!', 'Removida com sucesso')
                                      router.refresh()
                                    }}>
                                      Excluir aula
                                    </button>
                                  </div>
                                </details>
                              </div>
                            ))}
                            <div className="pt-2">
                              <Button size="sm" variant="secondary" onClick={() => router.push(`/admin/treinamentos/${treinamento.id}/modulos/${modulo.id}/slides`)}>
                                <Presentation className="w-4 h-4 mr-2" /> Gerenciar aulas
                              </Button>
                            </div>
                          </div>
                        </details>
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        {addOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => !salvandoModulo && setAddOpen(false)}></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Adicionar Módulo</h3>
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => !salvandoModulo && setAddOpen(false)}>✕</button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      value={novoTitulo}
                      onChange={(e) => setNovoTitulo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Introdução"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={novoDescricao}
                      onChange={(e) => setNovoDescricao(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${novoTipo === 'slides' ? 'border-primary bg-blue-50' : 'border-gray-300'}`}>
                      <input type="radio" name="novoTipo" checked={novoTipo === 'slides'} onChange={() => setNovoTipo('slides')} />
                      <span>Slides</span>
                    </label>
                    <label className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${novoTipo === 'video' ? 'border-primary bg-blue-50' : 'border-gray-300'}`}>
                      <input type="radio" name="novoTipo" checked={novoTipo === 'video'} onChange={() => setNovoTipo('video')} />
                      <span>Vídeo</span>
                    </label>
                    <label className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${novoTipo === 'texto' ? 'border-primary bg-blue-50' : 'border-gray-300'}`}>
                      <input type="radio" name="novoTipo" checked={novoTipo === 'texto'} onChange={() => setNovoTipo('texto')} />
                      <span>Texto</span>
                    </label>
                  </div>
                  {novoTipo === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do vídeo</label>
                      <input
                        type="url"
                        value={novoVideoUrl}
                        onChange={(e) => setNovoVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  )}
                  {novoTipo === 'texto' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (HTML/Markdown)</label>
                      <textarea
                        value={novoConteudo}
                        onChange={(e) => setNovoConteudo(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                        placeholder="Cole o conteúdo..."
                      />
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={() => setAddOpen(false)} disabled={salvandoModulo}>Cancelar</Button>
                  <Button onClick={async () => {
                    if (!novoTitulo.trim()) { toast.warning('Título obrigatório', 'Informe o título do módulo'); return }
                    setSalvandoModulo(true)
                    try {
                      const supabase = createClient()
                      const ordem = (treinamento.modulos?.length || 0) + 1
                      const { error } = await supabase.from('modulos').insert({
                        treinamento_id: treinamento.id,
                        titulo: novoTitulo.trim(),
                        descricao: novoDescricao.trim() || null,
                        conteudo: novoTipo === 'texto' ? (novoConteudo || null) : null,
                        video_url: novoTipo === 'video' ? (novoVideoUrl || null) : null,
                        ordem
                      })
                      if (error) throw error
                      toast.success('Módulo criado!', 'Você pode adicionar slides e testes agora')
                      setAddOpen(false)
                      setNovoTitulo(''); setNovoDescricao(''); setNovoVideoUrl(''); setNovoConteudo(''); setNovoTipo('slides')
                      router.refresh()
                    } catch (e: any) {
                      console.error(e)
                      toast.error('Erro ao criar módulo', e.message || 'Tente novamente')
                    } finally {
                      setSalvandoModulo(false)
                    }
                  }} disabled={salvandoModulo}>
                    {salvandoModulo ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {editOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => !salvandoEdicao && setEditOpen(null)}></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Editar Módulo</h3>
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => !salvandoEdicao && setEditOpen(null)}>✕</button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL do vídeo (opcional)</label>
                    <input
                      type="url"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (HTML/Markdown, opcional)</label>
                    <textarea
                      value={editConteudo}
                      onChange={(e) => setEditConteudo(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={() => setEditOpen(null)} disabled={salvandoEdicao}>Cancelar</Button>
                  <Button onClick={async () => {
                    if (!editTitulo.trim()) { toast.warning('Título obrigatório', 'Informe o título'); return }
                    setSalvandoEdicao(true)
                    try {
                      const supabase = createClient()
                      const { error } = await supabase
                        .from('modulos')
                        .update({
                          titulo: editTitulo.trim(),
                          descricao: editDescricao.trim() || null,
                          video_url: editVideoUrl.trim() || null,
                          conteudo: editConteudo || null
                        })
                        .eq('id', editOpen.id)
                      if (error) throw error
                      toast.success('Módulo atualizado!', 'Alterações salvas')
                      setEditOpen(null)
                      router.refresh()
                    } catch (e: any) {
                      console.error(e)
                      toast.error('Erro ao atualizar módulo', e.message || 'Tente novamente')
                    } finally {
                      setSalvandoEdicao(false)
                    }
                  }} disabled={salvandoEdicao}>{salvandoEdicao ? 'Salvando...' : 'Salvar'}</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

