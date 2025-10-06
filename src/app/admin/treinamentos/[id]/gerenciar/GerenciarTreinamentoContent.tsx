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
  Plus
} from 'lucide-react'

interface GerenciarTreinamentoContentProps {
  profile: any
  treinamento: any
}

export default function GerenciarTreinamentoContent({ 
  profile, 
  treinamento 
}: GerenciarTreinamentoContentProps) {
  const router = useRouter()
  
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

