'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  FileText,
  Video,
  Presentation,
  Layers,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react'

interface CriarTreinamentoWizardProps {
  profile: any
}

type TipoConteudo = 'slides' | 'video' | 'texto' | 'misto'

interface Modulo {
  id: string
  titulo: string
  descricao: string
  tipo: 'slide' | 'video' | 'texto'
  video_url?: string
  conteudo?: string
  ordem: number
}

export function CriarTreinamentoWizard({ profile }: CriarTreinamentoWizardProps) {
  const router = useRouter()
  const toast = useToast()
  
  const [etapa, setEtapa] = useState(1)
  const [salvando, setSalvando] = useState(false)
  
  // Dados do treinamento
  const [dadosBasicos, setDadosBasicos] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    duracao: '',
    imagem: '',
    tipo_conteudo: 'slides' as TipoConteudo,
    ativo: true
  })
  const [capaFile, setCapaFile] = useState<File | null>(null)
  const [capaPreview, setCapaPreview] = useState('')
  
  const [modulos, setModulos] = useState<Modulo[]>([])
  
  const tiposConteudo = [
    {
      value: 'slides',
      label: 'Apresentação de Slides',
      icon: Presentation,
      description: 'Slides sequenciais com texto, imagens e vídeos'
    },
    {
      value: 'video',
      label: 'Vídeo-aula',
      icon: Video,
      description: 'Aulas em vídeo do YouTube, Vimeo ou upload próprio'
    },
    {
      value: 'texto',
      label: 'Texto/Apostila',
      icon: FileText,
      description: 'Conteúdo em texto formatado (markdown ou HTML)'
    },
    {
      value: 'misto',
      label: 'Misto',
      icon: Layers,
      description: 'Combina slides, vídeos e textos'
    }
  ]
  
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
  
  const handleAddModulo = () => {
    const novoModulo: Modulo = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: '',
      descricao: '',
      tipo: dadosBasicos.tipo_conteudo === 'video' ? 'video' : 'slide',
      ordem: modulos.length + 1
    }
    setModulos([...modulos, novoModulo])
  }
  
  const handleRemoveModulo = (id: string) => {
    setModulos(modulos.filter(m => m.id !== id))
  }
  
  const handleUpdateModulo = (id: string, field: string, value: any) => {
    setModulos(modulos.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }
  
  const handleSalvar = async () => {
    // Validações
    if (!dadosBasicos.titulo) {
      toast.warning('Campo obrigatório', 'Preencha o título do treinamento')
      return
    }
    
    if (modulos.length === 0) {
      toast.warning('Adicione módulos', 'O treinamento precisa ter pelo menos um módulo')
      return
    }
    
    // Validar se todos os módulos têm título
    const moduloSemTitulo = modulos.find(m => !m.titulo)
    if (moduloSemTitulo) {
      toast.warning('Módulo incompleto', 'Todos os módulos precisam ter título')
      return
    }
    
    setSalvando(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // 0. Definir capa automática do YouTube se for vídeo e não houver imagem/capa enviada
      let imagemUrl = dadosBasicos.imagem
      if (!imagemUrl && !capaFile && dadosBasicos.tipo_conteudo === 'video') {
        const primeiroVideo = modulos.find(m => !!m.video_url)
        if (primeiroVideo?.video_url) {
          const vid = extractYouTubeId(primeiroVideo.video_url)
          if (vid) {
            imagemUrl = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`
          }
        }
      }
      // Upload de capa (se houver arquivo)
      if (capaFile) {
        if (capaFile.size > 3 * 1024 * 1024) {
          toast.error('Imagem muito grande', 'O arquivo deve ter no máximo 3MB')
          setSalvando(false)
          return
        }
        const ext = (capaFile.name.split('.').pop() || 'jpg').toLowerCase()
        const filePath = `capas/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('treinamentos-imagens')
          .upload(filePath, capaFile, { cacheControl: '3600', upsert: false })
        if (upErr) {
          toast.error('Falha no upload', upErr.message)
          setSalvando(false)
          return
        }
        const { data: pub } = supabase.storage
          .from('treinamentos-imagens')
          .getPublicUrl(filePath)
        imagemUrl = pub.publicUrl
      }

      // 1. Criar treinamento
      const { data: treinamento, error: treinamentoError } = await supabase
        .from('treinamentos')
        .insert({
          ...dadosBasicos,
          imagem: imagemUrl || null,
          created_by: user.id
        })
        .select()
        .single()
      
      if (treinamentoError) throw treinamentoError
      
      // 2. Criar módulos
      const modulosParaInserir = modulos.map((m, index) => ({
        treinamento_id: treinamento.id,
        titulo: m.titulo,
        descricao: m.descricao || null,
        conteudo: m.conteudo || null,
        video_url: m.video_url || null,
        ordem: index + 1
      }))
      
      const { error: modulosError } = await supabase
        .from('modulos')
        .insert(modulosParaInserir)
      
      if (modulosError) throw modulosError
      
      toast.success('Treinamento criado!', `"${dadosBasicos.titulo}" foi adicionado com ${modulos.length} módulo(s)`)
      
      setTimeout(() => {
        router.push('/admin/treinamentos')
        router.refresh()
      }, 1500)
      
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao criar treinamento', error.message)
    } finally {
      setSalvando(false)
    }
  }
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  etapa >= step 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${
                    etapa > step ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm">
            <span className={etapa >= 1 ? 'text-primary font-medium' : 'text-gray-500'}>
              Informações Básicas
            </span>
            <span className={etapa >= 2 ? 'text-primary font-medium' : 'text-gray-500'}>
              Tipo de Conteúdo
            </span>
            <span className={etapa >= 3 ? 'text-primary font-medium' : 'text-gray-500'}>
              Módulos
            </span>
          </div>
        </div>
        
        {/* Etapa 1: Informações Básicas */}
        {etapa === 1 && (
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">
                Informações Básicas do Treinamento
              </h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <Input
                label="Título do Treinamento *"
                value={dadosBasicos.titulo}
                onChange={(e) => setDadosBasicos({ ...dadosBasicos, titulo: e.target.value })}
                placeholder="Ex: Introdução à Corretagem de Seguros"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={dadosBasicos.descricao}
                  onChange={(e) => setDadosBasicos({ ...dadosBasicos, descricao: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descreva o conteúdo e objetivos do treinamento..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Categoria"
                  value={dadosBasicos.categoria}
                  onChange={(e) => setDadosBasicos({ ...dadosBasicos, categoria: e.target.value })}
                  placeholder="Ex: Técnico, Comercial, Gestão"
                />
                
                <Input
                  label="Duração Estimada"
                  value={dadosBasicos.duracao}
                  onChange={(e) => setDadosBasicos({ ...dadosBasicos, duracao: e.target.value })}
                  placeholder="Ex: 4 horas, 2 dias"
                />
              </div>
              
              <Input
                label="URL da Imagem de Capa"
                type="url"
                value={dadosBasicos.imagem}
                onChange={(e) => setDadosBasicos({ ...dadosBasicos, imagem: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                helperText="Cole a URL de uma imagem para o card do treinamento"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload da Imagem de Capa (recomendado 1200x675)
                </label>
                <div className="flex items-start gap-4">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setCapaFile(file)
                      if (file) {
                        const url = URL.createObjectURL(file)
                        setCapaPreview(url)
                      } else {
                        setCapaPreview('')
                      }
                    }}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                  />
                  {capaPreview && (
                    <img
                      src={capaPreview}
                      alt="Prévia da capa"
                      className="w-40 h-22 rounded-lg border border-border object-cover"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: JPG, PNG, WEBP. Tamanho ideal: 1200x675px (16:9). Máx. 3MB.
                </p>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setEtapa(2)}
                  disabled={!dadosBasicos.titulo}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Etapa 2: Tipo de Conteúdo */}
        {etapa === 2 && (
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">
                Escolha o Tipo de Conteúdo
              </h2>
              <p className="text-gray-600 mt-2">
                Selecione como o conteúdo será apresentado aos alunos
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {tiposConteudo.map((tipo) => {
                  const Icon = tipo.icon
                  const isSelected = dadosBasicos.tipo_conteudo === tipo.value
                  
                  return (
                    <button
                      key={tipo.value}
                      onClick={() => setDadosBasicos({ ...dadosBasicos, tipo_conteudo: tipo.value as TipoConteudo })}
                      className={`
                        p-6 rounded-xl border-2 text-left transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-bold mb-1 ${
                            isSelected ? 'text-primary' : 'text-gray-900'
                          }`}>
                            {tipo.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {tipo.description}
                          </p>
                        </div>
                        
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEtapa(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                
                <Button
                  onClick={() => setEtapa(3)}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Etapa 3: Módulos */}
        {etapa === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Adicionar Módulos
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Crie os módulos que compõem o treinamento "{dadosBasicos.titulo}"
                    </p>
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={handleAddModulo}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Módulo
                  </Button>
                </div>
              </CardHeader>
            </Card>
            
            {/* Lista de Módulos */}
            {modulos.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nenhum módulo adicionado ainda</p>
                  <Button onClick={handleAddModulo}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Módulo
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {modulos.map((modulo, index) => (
                  <Card key={modulo.id}>
                    <CardBody className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 pt-2">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-gray-900">
                              Módulo {index + 1}
                            </h3>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveModulo(modulo.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                          
                          <Input
                            label="Título do Módulo *"
                            value={modulo.titulo}
                            onChange={(e) => handleUpdateModulo(modulo.id, 'titulo', e.target.value)}
                            placeholder="Ex: Introdução ao tema"
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Descrição
                            </label>
                            <textarea
                              value={modulo.descricao}
                              onChange={(e) => handleUpdateModulo(modulo.id, 'descricao', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Breve descrição do módulo..."
                            />
                          </div>
                          
                          {/* Campos específicos por tipo */}
                          {dadosBasicos.tipo_conteudo === 'video' && (
                            <Input
                              label="URL do Vídeo"
                              type="url"
                              value={modulo.video_url || ''}
                              onChange={(e) => handleUpdateModulo(modulo.id, 'video_url', e.target.value)}
                              placeholder="https://youtube.com/watch?v=..."
                              helperText="Cole a URL do YouTube, Vimeo ou link direto"
                            />
                          )}
                          
                          {dadosBasicos.tipo_conteudo === 'texto' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Conteúdo
                              </label>
                              <textarea
                                value={modulo.conteudo || ''}
                                onChange={(e) => handleUpdateModulo(modulo.id, 'conteudo', e.target.value)}
                                rows={6}
                                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                placeholder="Cole o conteúdo em HTML ou Markdown..."
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Suporta HTML e Markdown
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Botões de Ação */}
            <Card>
              <CardBody className="p-6">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setEtapa(2)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {modulos.length} módulo(s) adicionado(s)
                  </div>
                  
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSalvar}
                    disabled={salvando || modulos.length === 0}
                  >
                    {salvando ? (
                      <>Salvando...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Criar Treinamento
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

