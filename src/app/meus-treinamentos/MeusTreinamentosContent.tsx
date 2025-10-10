'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BookOpen,
  Clock,
  CheckCircle,
  Play,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MeusTreinamentosContentProps {
  profile: any
  treinamentos: any[]
}

export function MeusTreinamentosContent({ profile, treinamentos }: MeusTreinamentosContentProps) {
  const router = useRouter()
  
  const treinamentosEmAndamento = treinamentos.filter(
    t => t.modulos.length > 0 && t.modulosConcluidos < t.modulos.length
  )
  
  const treinamentosConcluidos = treinamentos.filter(
    t => t.modulosConcluidos === t.modulos.length && t.modulos.length > 0
  )
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Treinamentos
          </h2>
          <p className="text-gray-600">
            Acompanhe o progresso dos seus treinamentos
          </p>
        </div>
        
        {/* Treinamentos Em Andamento */}
        {treinamentosEmAndamento.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Em Andamento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {treinamentosEmAndamento.map((item) => {
                const progressoAcumulado = item.modulos.reduce((acc: number, m: any) => {
                  if (m.concluido) return acc + 1
                  const p = typeof m.progresso_percentual === 'number' ? m.progresso_percentual : 0
                  return acc + (p / 100)
                }, 0)
                const progressoPerc = Math.max(0, Math.min(100, Math.round((progressoAcumulado / item.modulos.length) * 100)))
                const ultimoAcesso = item.modulos.sort(
                  (a: any, b: any) => 
                    new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
                )[0]
                
                return (
                  <Card key={item.treinamento.id} hover>
                    {item.treinamento.imagem && (
                      <div className="h-48 overflow-hidden rounded-t-xl">
                        <img
                          src={item.treinamento.imagem}
                          alt={item.treinamento.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardBody>
                      <div className="mb-4">
                        {item.treinamento.categoria && (
                          <span className="inline-block px-3 py-1 bg-orange/10 text-orange text-xs font-medium rounded-full capitalize mb-3">
                            {item.treinamento.categoria}
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.treinamento.titulo}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>
                              {item.modulosConcluidos} de {item.modulos.length} módulos
                            </span>
                          </div>
                          {ultimoAcesso && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(ultimoAcesso.data_inicio), 'dd/MM/yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">Progresso</span>
                          <span className="font-bold text-orange">{progressoPerc}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange h-2 rounded-full transition-all"
                            style={{ width: `${progressoPerc}%` }}
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => router.push(`/treinamentos/${item.treinamento.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continuar
                      </Button>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Treinamentos Concluídos */}
        {treinamentosConcluidos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Concluídos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treinamentosConcluidos.map((item) => {
                const dataConclusao = item.modulos
                  .filter((m: any) => m.data_conclusao)
                  .sort((a: any, b: any) => 
                    new Date(b.data_conclusao).getTime() - new Date(a.data_conclusao).getTime()
                  )[0]?.data_conclusao
                
                return (
                  <Card key={item.treinamento.id} hover>
                    {item.treinamento.imagem && (
                      <div className="h-40 overflow-hidden rounded-t-xl relative">
                        <img
                          src={item.treinamento.imagem}
                          alt={item.treinamento.titulo}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Concluído</span>
                        </div>
                      </div>
                    )}
                    <CardBody>
                      {item.treinamento.categoria && (
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize mb-3">
                          {item.treinamento.categoria}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.treinamento.titulo}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{item.modulos.length} módulos</span>
                        </div>
                        {dataConclusao && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(dataConclusao), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => router.push(`/treinamentos/${item.treinamento.id}`)}
                      >
                        Revisar
                      </Button>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Nenhum treinamento */}
        {treinamentos.length === 0 && (
          <Card>
            <CardBody className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum treinamento iniciado
              </h3>
              <p className="text-gray-600 mb-6">
                Acesse o dashboard para iniciar seus treinamentos
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard')}
              >
                Ir para Dashboard
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

