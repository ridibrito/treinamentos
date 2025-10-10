'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'

interface FormTreinamentoProps {
  profile: any
  treinamento?: any
  modulos?: { id: string; video_url?: string | null; ordem?: number }[]
}

export function FormTreinamento({ profile, treinamento, modulos = [] }: FormTreinamentoProps) {
  const router = useRouter()
  const toast = useToast()
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState({
    titulo: treinamento?.titulo || '',
    descricao: treinamento?.descricao || '',
    categoria: treinamento?.categoria || '',
    duracao: treinamento?.duracao || '',
    imagem: treinamento?.imagem || '',
    tipo_conteudo: treinamento?.tipo_conteudo || 'slides' as 'slides' | 'video' | 'texto' | 'misto',
    ativo: treinamento?.ativo ?? true
  })

  const extractYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.split('/')[1] || null
      }
      if (u.searchParams.get('v')) {
        return u.searchParams.get('v')
      }
      const path = u.pathname
      const match = path.match(/\/embed\/([\w-]+)/) || path.match(/\/shorts\/([\w-]+)/)
      if (match && match[1]) return match[1]
      return null
    } catch {
      return null
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Capa automática do YouTube se tipo=video e imagem vazia
      let imagem = formData.imagem
      if (!imagem && formData.tipo_conteudo === 'video' && modulos.length > 0) {
        const primeiroVideo = modulos.find(m => !!m.video_url)
        if (primeiroVideo?.video_url) {
          const vid = extractYouTubeId(primeiroVideo.video_url)
          if (vid) {
            imagem = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`
          }
        }
      }
      
      if (treinamento) {
        // Atualizar
        const { error } = await supabase
          .from('treinamentos')
          .update({ ...formData, imagem })
          .eq('id', treinamento.id)
        
        if (error) throw error
        
        toast.success('Treinamento atualizado!', `"${formData.titulo}" foi salvo com sucesso`)
      } else {
        // Criar
        const { error } = await supabase
          .from('treinamentos')
          .insert({
            ...formData,
            imagem,
            created_by: user.id
          })
        
        if (error) throw error
        
        toast.success('Treinamento criado!', `"${formData.titulo}" foi adicionado à plataforma`)
      }
      
      setTimeout(() => {
        router.push('/admin/treinamentos')
        router.refresh()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar', error.message || 'Não foi possível salvar o treinamento')
    } finally {
      setSalvando(false)
    }
  }
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900">
              {treinamento ? 'Editar Treinamento' : 'Novo Treinamento'}
            </h1>
          </CardHeader>
          
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Título *"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                required
                placeholder="Ex: Introdução à Corretagem"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descreva o conteúdo do treinamento..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipo do Treinamento
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => handleChange('categoria', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecione...</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Operadora">Operadora</option>
                    <option value="Produtos">Produtos</option>
                    <option value="Atendimento">Atendimento</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Marketing">Marketing</option>
                    <option value="RH">RH</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Ex.: Comercial, Técnico, Operadora…</p>
                </div>
                
                <Input
                  label="Duração"
                  value={formData.duracao}
                  onChange={(e) => handleChange('duracao', e.target.value)}
                  placeholder="Ex: 4 horas"
                />
              </div>
              
              <Input
                label="URL da Imagem"
                type="url"
                value={formData.imagem}
                onChange={(e) => handleChange('imagem', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                helperText="Se vazio e for vídeo, usaremos automaticamente a miniatura do YouTube do primeiro módulo com vídeo"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de Conteúdo
                </label>
                <select
                  value={formData.tipo_conteudo}
                  onChange={(e) => handleChange('tipo_conteudo', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="slides">📊 Slides - Apresentação sequencial</option>
                  <option value="video">🎥 Vídeo - Vídeo-aulas</option>
                  <option value="texto">📄 Texto - Apostila/Documento</option>
                  <option value="misto">📚 Misto - Combina tudo</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Define como o conteúdo será apresentado aos alunos
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => handleChange('ativo', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Treinamento ativo (visível para os alunos)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={salvando}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}

