'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ArrowLeft,
  Sparkles,
  Save,
  Printer,
  Maximize2,
  Loader2,
  X,
  RefreshCw,
  MessageCircle,
  Send
} from 'lucide-react'

interface EditorApostilaProps {
  profile: any
  treinamento: any
  apostilaExistente: any
}

export function EditorApostilaSimplificado({ profile, treinamento, apostilaExistente }: EditorApostilaProps) {
  const router = useRouter()
  const toast = useToast()
  
  const [textoOriginal, setTextoOriginal] = useState('')
  const [htmlFormatado, setHtmlFormatado] = useState('')
  const [processando, setProcessando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [etapa, setEtapa] = useState<'texto' | 'formatando' | 'gerando-imagens' | 'concluido'>('texto')
  const [progresso, setProgresso] = useState({ atual: 0, total: 0, descricao: '' })
  const [modoTela, setModoTela] = useState<'normal' | 'fullscreen'>('normal')
  const [chatAberto, setChatAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [inputChat, setInputChat] = useState('')
  const [processandoChat, setProcessandoChat] = useState(false)
  
  const handleProcessar = async () => {
    if (!textoOriginal.trim()) {
      toast.warning('Texto vazio', 'Cole ou digite o conteúdo da apostila')
      return
    }
    
    setProcessando(true)
    setEtapa('formatando')
    setProgresso({ atual: 0, total: 0, descricao: 'Formatando texto com IA...' })
    
    try {
      // ETAPA 1: Formatar texto
      const formatResponse = await fetch('/api/gemini/formatar-apostila', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: textoOriginal,
          titulo: treinamento.titulo,
          categoria: treinamento.categoria
        })
      })
      
      if (!formatResponse.ok) {
        const data = await formatResponse.json()
        throw new Error(data.message || 'Erro ao formatar')
      }
      
      const { html } = await formatResponse.json()
      
      // ETAPA 2: Detectar e gerar imagens
      const regexSugestao = /<div\s+class="image-suggestion"[^>]*data-suggestion="([^"]*)"[^>]*>[\s\S]*?<\/div>/gi
      const matches = [...html.matchAll(regexSugestao)]
      
      let htmlFinal = html
      
      if (matches.length > 0) {
        setEtapa('gerando-imagens')
        setProgresso({ atual: 0, total: matches.length, descricao: 'Gerando imagens com IA...' })
        
        let imagensReais = 0
        let imagensFallback = 0
        
        for (let i = 0; i < matches.length; i++) {
          const [divCompleta, descricao] = [matches[i][0], matches[i][1]]
          
          setProgresso({ 
            atual: i + 1, 
            total: matches.length, 
            descricao: descricao.substring(0, 60) + '...'
          })
          
          try {
            const imgResponse = await fetch('/api/gemini/gerar-imagem', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ descricao })
            })
            
            if (i < matches.length - 1) {
              await new Promise(r => setTimeout(r, 1000))
            }
            
            if (!imgResponse.ok) continue
            
            const { mimeType, imageData, isFallback } = await imgResponse.json()
            
            if (isFallback) imagensFallback++
            else imagensReais++
            
            const imagemUrl = `data:${mimeType};base64,${imageData}`
            const figureHtml = `<figure class="my-6">
  <img src="${imagemUrl}" alt="${descricao}" class="w-full rounded-lg shadow-md" style="max-width: 100%; height: auto;" />
  <figcaption class="text-sm text-gray-600 mt-2 text-center italic">${descricao}</figcaption>
</figure>`
            
            htmlFinal = htmlFinal.replace(divCompleta, figureHtml)
            
          } catch (error) {
            console.error(`Erro imagem ${i + 1}:`, error)
          }
        }
        
        if (imagensReais === matches.length) {
          toast.success('✨ Apostila completa!', `Texto formatado + ${imagensReais} imagens REAIS!`)
        } else if (imagensReais > 0) {
          toast.success('Apostila pronta!', `${imagensReais} imagens reais + ${imagensFallback} SVG`)
        } else {
          toast.success('Apostila formatada!', `${matches.length} imagens SVG`)
        }
      } else {
        toast.success('Texto formatado!', 'Sem necessidade de imagens')
      }
      
      setHtmlFormatado(htmlFinal)
      setEtapa('concluido')
      
    } catch (error: any) {
      console.error('Erro:', error)
      setEtapa('texto')
      
      if (error.message.includes('GEMINI_API_KEY')) {
        toast.error('API Key não configurada', 'Configure GEMINI_API_KEY no .env.local')
      } else {
        toast.error('Erro ao processar', error.message)
      }
    } finally {
      setProcessando(false)
    }
  }
  
  const handleSalvar = async () => {
    if (!htmlFormatado) {
      toast.warning('Nada para salvar', 'Processe o texto primeiro')
      return
    }
    
    setSalvando(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      if (apostilaExistente) {
        const { error } = await supabase
          .from('apostilas')
          .update({ apresentacao: htmlFormatado, updated_at: new Date().toISOString() })
          .eq('id', apostilaExistente.id)
        
        if (error) throw error
        toast.success('Apostila atualizada!', 'Conteúdo salvo com sucesso')
      } else {
        const { error } = await supabase
          .from('apostilas')
          .insert({
            treinamento_id: treinamento.id,
            versao: 1,
            apresentacao: htmlFormatado,
            capa: JSON.stringify({
              titulo: treinamento.titulo,
              subtitulo: treinamento.descricao || '',
              data: new Date().toLocaleDateString('pt-BR')
            }),
            watermark: 'Material interno DF Corretora',
            ativo: true,
            created_by: user.id
          })
        
        if (error) throw error
        toast.success('Apostila criada!', 'Conteúdo salvo com sucesso')
      }
      
      router.refresh()
      
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar', error.message)
    } finally {
      setSalvando(false)
    }
  }
  
  const handleImprimir = () => {
    if (!htmlFormatado) {
      toast.warning('Nada para imprimir', 'Processe o texto primeiro')
      return
    }
    setModoTela('fullscreen')
    setTimeout(() => window.print(), 300)
  }
  
  const handleEnviarMensagem = async () => {
    if (!inputChat.trim()) return
    
    const mensagemUsuario = inputChat.trim()
    setInputChat('')
    
    // Adicionar mensagem do usuário
    setMensagens(prev => [...prev, { role: 'user', content: mensagemUsuario }])
    setProcessandoChat(true)
    
    try {
      // Enviar para IA refinar
      const response = await fetch('/api/gemini/refinar-apostila', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlAtual: htmlFormatado,
          comando: mensagemUsuario
        })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao processar comando')
      }
      
      const { html } = await response.json()
      
      // Verificar se há novas sugestões de imagem para gerar
      const regexSugestao = /<div\s+class="image-suggestion"[^>]*data-suggestion="([^"]*)"[^>]*>[\s\S]*?<\/div>/gi
      const matchesAnteriores = [...htmlFormatado.matchAll(regexSugestao)]
      const matchesNovos = [...html.matchAll(regexSugestao)]
      
      let htmlFinal = html
      
      // Se há novas sugestões, gerar imagens automaticamente
      const novasSugestoes = matchesNovos.length - matchesAnteriores.length
      if (novasSugestoes > 0) {
        toast.info(`Gerando ${novasSugestoes} nova(s) imagem(ns)...`, 'Aguarde')
        
        for (const match of matchesNovos) {
          const divCompleta = match[0]
          const descricao = match[1]
          
          // Pular se já existe como figure
          if (htmlFormatado.includes(descricao) && htmlFormatado.includes('<figure')) continue
          
          try {
            const imgResponse = await fetch('/api/gemini/gerar-imagem', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ descricao })
            })
            
            if (!imgResponse.ok) continue
            
            const { mimeType, imageData } = await imgResponse.json()
            const imagemUrl = `data:${mimeType};base64,${imageData}`
            const figureHtml = `<figure class="my-6">
  <img src="${imagemUrl}" alt="${descricao}" class="w-full rounded-lg shadow-md" style="max-width: 100%; height: auto;" />
  <figcaption class="text-sm text-gray-600 mt-2 text-center italic">${descricao}</figcaption>
</figure>`
            
            htmlFinal = htmlFinal.replace(divCompleta, figureHtml)
          } catch (error) {
            console.error('Erro ao gerar nova imagem:', error)
          }
        }
      }
      
      setHtmlFormatado(htmlFinal)
      setMensagens(prev => [...prev, { 
        role: 'assistant', 
        content: 'Apostila atualizada conforme solicitado!' 
      }])
      
      toast.success('Atualizado!', 'Mudanças aplicadas com sucesso')
      
    } catch (error: any) {
      console.error('Erro no chat:', error)
      setMensagens(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar seu comando.' 
      }])
      toast.error('Erro', error.message)
    } finally {
      setProcessandoChat(false)
    }
  }
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Editor de Apostila com IA
            </h1>
          </div>
        </div>

        {/* Info do Treinamento */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{treinamento.titulo}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Categoria: <span className="font-medium">{treinamento.categoria}</span>
                </p>
              </div>
              
              {etapa === 'concluido' && (
                <div className="flex gap-2">
                  <Button
                    variant={chatAberto ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setChatAberto(!chatAberto)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat com IA
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReprocessar}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Novo Texto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModoTela('fullscreen')}
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Tela Cheia
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImprimir}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSalvar}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Apostila
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Modo Fullscreen */}
        {modoTela === 'fullscreen' ? (
          <div className="fixed inset-0 z-50 bg-white overflow-auto print:block">
            <div className="no-print sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
              <h2 className="text-lg font-semibold">Preview - Modo Tela Cheia</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleImprimir}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={() => setModoTela('normal')}>
                  <X className="w-4 h-4 mr-2" />
                  Fechar
                </Button>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto p-12 apostila-content">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlFormatado }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Tela de Input */}
            {etapa === 'texto' && (
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cole ou digite o texto da apostila:
                      </label>
                      <textarea
                        value={textoOriginal}
                        onChange={(e) => setTextoOriginal(e.target.value)}
                        placeholder="Cole aqui o texto que será transformado em apostila profissional com imagens geradas por IA..."
                        className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={handleProcessar}
                        disabled={processando || !textoOriginal.trim()}
                        className="px-8 py-3"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Criar Apostila com IA
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Tela de Processamento */}
            {(etapa === 'formatando' || etapa === 'gerando-imagens') && (
              <Card>
                <CardBody>
                  <div className="py-16 px-8 text-center">
                    {/* Animação de Loading */}
                    <div className="mb-8">
                      <div className="relative inline-block">
                        <div className="w-24 h-24 border-8 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                        <Sparkles className="w-12 h-12 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    
                    {/* Etapa Atual */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {etapa === 'formatando' ? '🤖 Formatando Texto' : '🎨 Gerando Imagens'}
                    </h2>
                    
                    {/* Descrição */}
                    <p className="text-gray-600 mb-6">
                      {progresso.descricao}
                    </p>
                    
                    {/* Barra de Progresso (apenas para imagens) */}
                    {etapa === 'gerando-imagens' && progresso.total > 0 && (
                      <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Gerando imagens...</span>
                          <span className="font-semibold">{progresso.atual} de {progresso.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary to-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(progresso.atual / progresso.total) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          {progresso.descricao}
                        </p>
                      </div>
                    )}
                    
                    {/* Aviso */}
                    <p className="text-sm text-gray-500 mt-8">
                      Aguarde, isso pode levar alguns minutos...
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Tela de Resultado */}
            {etapa === 'concluido' && (
              <div className={`grid ${chatAberto ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {/* Preview da Apostila */}
                <div className={chatAberto ? 'lg:col-span-2' : 'col-span-1'}>
                  <Card>
                    <CardBody>
                      <div className="apostila-preview max-h-[800px] overflow-auto">
                        <div 
                          className="prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: htmlFormatado }}
                        />
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Chat com IA */}
                {chatAberto && (
                  <div className="lg:col-span-1">
                    <Card>
                      <CardBody>
                        <div className="flex flex-col h-[800px]">
                          {/* Header do Chat */}
                          <div className="pb-4 border-b border-gray-200 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              💬 Chat com IA
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Peça ajustes na apostila
                            </p>
                          </div>
                          
                          {/* Mensagens */}
                          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {mensagens.length === 0 ? (
                              <div className="text-center py-8 text-gray-400">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Inicie uma conversa!</p>
                                <p className="text-xs mt-2">Exemplos:</p>
                                <div className="text-xs space-y-1 mt-3 text-left max-w-xs mx-auto">
                                  <p>• "Adicione uma imagem sobre X"</p>
                                  <p>• "Deixe o título maior"</p>
                                  <p>• "Remova a segunda imagem"</p>
                                  <p>• "Adicione um resumo no início"</p>
                                </div>
                              </div>
                            ) : (
                              mensagens.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                      msg.role === 'user'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                </div>
                              ))
                            )}
                            
                            {processandoChat && (
                              <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg px-4 py-2">
                                  <div className="flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                    <span className="text-sm text-gray-600">Processando...</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Input do Chat */}
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={inputChat}
                                onChange={(e) => setInputChat(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !processandoChat) {
                                    handleEnviarMensagem()
                                  }
                                }}
                                placeholder="Ex: Adicione uma imagem sobre..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                disabled={processandoChat}
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={handleEnviarMensagem}
                                disabled={processandoChat || !inputChat.trim()}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Pressione Enter para enviar
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
  
  function handleReprocessar() {
    setEtapa('texto')
    setHtmlFormatado('')
    setProgresso({ atual: 0, total: 0, descricao: '' })
  }
}

