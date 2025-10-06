'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  Circle,
  Play,
  ArrowLeft,
  FileText,
  Download
} from 'lucide-react'

interface TreinamentoContentProps {
  profile: any
  treinamento: any
  progresso: any[]
  apostila: any
}

export function TreinamentoContent({ 
  profile, 
  treinamento, 
  progresso,
  apostila
}: TreinamentoContentProps) {
  const router = useRouter()
  
  const isModuloConcluido = (moduloId: string) => {
    return progresso.some(p => p.modulo_id === moduloId && p.concluido)
  }
  
  const modulosConcluidos = progresso.filter(p => p.concluido).length
  const totalModulos = treinamento.modulos.length
  const progressoPerc = totalModulos > 0 ? Math.round((modulosConcluidos / totalModulos) * 100) : 0
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-5xl mx-auto">
        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        
        {/* Cabeçalho do Treinamento */}
        <Card className="mb-8">
          {treinamento.imagem && (
            <div className="h-64 overflow-hidden rounded-t-xl">
              <img
                src={treinamento.imagem}
                alt={treinamento.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardBody className="p-8">
            <div className="mb-4">
              {treinamento.categoria && (
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full capitalize mb-4">
                  {treinamento.categoria}
                </span>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {treinamento.titulo}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {treinamento.descricao || 'Sem descrição disponível'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <BookOpen className="w-5 h-5" />
                <span>{totalModulos} módulo{totalModulos !== 1 ? 's' : ''}</span>
              </div>
              {treinamento.duracao && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{treinamento.duracao}</span>
                </div>
              )}
            </div>
            
            {/* Progresso */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Seu Progresso</span>
                <span className="font-bold text-primary">{progressoPerc}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progressoPerc}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {modulosConcluidos} de {totalModulos} módulos concluídos
              </p>
            </div>
            
            {/* Botão da Apostila */}
            {apostila && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/treinamentos/${treinamento.id}/apostila`)}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Visualizar Apostila
                  </Button>
                  
                  {apostila.arquivos && apostila.arquivos.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => window.open(apostila.arquivos[0].arquivo_url, '_blank')}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Lista de Módulos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Módulos do Treinamento
          </h2>
          
          <div className="space-y-4">
            {treinamento.modulos.map((modulo: any, index: number) => {
              const concluido = isModuloConcluido(modulo.id)
              const temTeste = modulo.testes && modulo.testes.length > 0
              
              return (
                <Card key={modulo.id} hover>
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          concluido ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {concluido ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Módulo {index + 1}: {modulo.titulo}
                            </h3>
                            {temTeste && (
                              <span className="px-2 py-1 bg-orange/10 text-orange text-xs font-medium rounded">
                                Com teste
                              </span>
                            )}
                          </div>
                          
                          {modulo.descricao && (
                            <p className="text-gray-600 mb-3">{modulo.descricao}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {modulo.duracao && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{modulo.duracao}</span>
                              </div>
                            )}
                            {concluido && (
                              <span className="text-green-600 font-medium">
                                ✓ Concluído
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant={concluido ? 'secondary' : 'primary'}
                        onClick={() => router.push(`/treinamentos/${treinamento.id}/modulos/${modulo.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {concluido ? 'Revisar' : 'Iniciar'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

