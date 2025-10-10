'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ArrowLeft,
  Edit,
  FileText,
  ClipboardList,
  Presentation,
  Video,
  FileEdit,
  CheckCircle,
  XCircle,
  Plus,
  Upload
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
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
  const [uploadingManual, setUploadingManual] = useState(false)
  const [manualUrl, setManualUrl] = useState<string | null>(treinamento.manual_url || null)
  const [selectedName, setSelectedName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // Carrega manual_vendas_url a partir de config
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'manual_vendas_url')
          .single()
        if (data?.value) setManualUrl(data.value)
      } catch {}
    })()
  }, [])
  
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
        {/* Manual de Vendas */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-gray-900">Manual de Vendas</h2>
                <span className="text-[11px] text-gray-500">PDF · máx 20MB</span>
              </div>
              <div className="flex items-center gap-2">
                {manualUrl && (
                  <Button size="sm" variant="ghost" onClick={() => window.open(manualUrl!, '_blank')}>
                    <FileText className="w-4 h-4 mr-2" /> Abrir
                  </Button>
                )}
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingManual}>
                  <Upload className="w-4 h-4 mr-2" /> {uploadingManual ? 'Enviando...' : 'Enviar PDF'}
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 my-1">PDF · máx 20MB {selectedName && `· ${selectedName}`}</p>
          </CardHeader>
          <CardBody className="space-y-2 py-4">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                disabled={uploadingManual}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setSelectedName(file.name)
                  if (file.type !== 'application/pdf') {
                    toast.error('Arquivo inválido', 'Envie um PDF.')
                    return
                  }
                  if (file.size > 20 * 1024 * 1024) {
                    toast.error('Arquivo muito grande', 'Tamanho máximo: 20MB.')
                    return
                  }
                  setUploadingManual(true)
                  try {
                    const supabase = createClient()
                    const path = `manuais/manual-vendas-${treinamento.id}-${Date.now()}.pdf`
                    const { error: upErr } = await supabase.storage
                      .from('apostilas')
                      .upload(path, file, { contentType: 'application/pdf', upsert: true })
                    if (upErr) throw upErr
                    const { data: pub } = await supabase.storage
                      .from('apostilas')
                      .getPublicUrl(path)
                    // Salvar no config (key manual_vendas_url)
                    const { error: upsertErr } = await supabase
                      .from('config')
                      .upsert({ key: 'manual_vendas_url', value: pub.publicUrl }, { onConflict: 'key' })
                    if (upsertErr) throw upsertErr
                    setManualUrl(pub.publicUrl)
                    toast.success('Manual atualizado!', 'PDF publicado.')
                    router.refresh()
                  } catch (err: any) {
                    console.error(err)
                    toast.error('Erro ao enviar manual', err.message || 'Tente novamente')
                  } finally {
                    setUploadingManual(false)
                    setSelectedName('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }
                }}
              />
              {!manualUrl && (
                <span className="text-xs text-gray-500">Nenhum manual publicado.</span>
              )}
            </div>
            {manualUrl && (
              <p className="text-[11px] text-gray-500">Atual: <a className="text-primary underline" href={manualUrl} target="_blank" rel="noreferrer">abrir</a></p>
            )}
          </CardBody>
        </Card>

        {/* Módulos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Módulos ({treinamento.modulos?.length || 0})
            </h2>
          </div>
          
          {treinamento.modulos?.length === 0 ? (
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
              {treinamento.modulos?.map((modulo: any, index: number) => {
                const slidesCount = modulo.slides?.[0]?.count || 0
                const temTeste = modulo.testes && modulo.testes.length > 0
                
                return (
                  <Card key={modulo.id} className="border-l-4 border-l-primary">
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
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
                      
                      {/* Ações */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(`/admin/treinamentos/${treinamento.id}/modulos/${modulo.id}/slides`)}
                        >
                          <Presentation className="w-4 h-4 mr-2" />
                          {slidesCount > 0 ? 'Editar' : 'Adicionar'} Slides ({slidesCount})
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={temTeste ? 'secondary' : 'primary'}
                          onClick={() => router.push(`/admin/treinamentos/${treinamento.id}/modulos/${modulo.id}/criar-teste`)}
                        >
                          <ClipboardList className="w-4 h-4 mr-2" />
                          {temTeste ? 'Editar' : 'Criar'} Teste
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

