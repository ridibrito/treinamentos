'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Filter,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ResultadosContentProps {
  profile: any
  resultados: any[]
}

export function ResultadosContent({ profile, resultados }: ResultadosContentProps) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<'todos' | 'aprovados' | 'reprovados'>('todos')
  
  // Filtrar resultados
  const resultadosFiltrados = resultados.filter(r => {
    if (filtro === 'aprovados') return r.aprovado
    if (filtro === 'reprovados') return !r.aprovado
    return true
  })
  
  // Estatísticas
  const totalTestes = resultados.length
  const aprovados = resultados.filter(r => r.aprovado).length
  const reprovados = resultados.filter(r => !r.aprovado).length
  const mediaGeral = totalTestes > 0
    ? (resultados.reduce((acc, r) => acc + r.pontuacao, 0) / totalTestes).toFixed(1)
    : '0.0'
  const taxaAprovacao = totalTestes > 0
    ? ((aprovados / totalTestes) * 100).toFixed(1)
    : '0.0'
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Resultados
          </h2>
          <p className="text-gray-600">
            Acompanhe seu desempenho nos testes realizados
          </p>
        </div>
        
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Testes</p>
                <p className="text-2xl font-bold text-gray-900">{totalTestes}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{aprovados}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reprovados</p>
                <p className="text-2xl font-bold text-red-600">{reprovados}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Média Geral</p>
                <p className="text-2xl font-bold text-gray-900">{mediaGeral}%</p>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Taxa de Aprovação */}
        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">Taxa de Aprovação</h2>
              </div>
              <span className="text-3xl font-bold text-primary">{taxaAprovacao}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${taxaAprovacao}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{aprovados} aprovados</span>
              <span>{reprovados} reprovados</span>
            </div>
          </CardBody>
        </Card>
        
        {/* Filtros */}
        <div className="mb-6 flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'todos'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-border'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('aprovados')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'aprovados'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-border'
              }`}
            >
              Aprovados
            </button>
            <button
              onClick={() => setFiltro('reprovados')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'reprovados'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-border'
              }`}
            >
              Reprovados
            </button>
          </div>
        </div>
        
        {/* Lista de Resultados */}
        {resultadosFiltrados.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhum resultado encontrado</p>
              <p className="text-sm text-gray-500">
                {filtro === 'todos' 
                  ? 'Você ainda não realizou nenhum teste' 
                  : `Nenhum teste ${filtro === 'aprovados' ? 'aprovado' : 'reprovado'} encontrado`}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {resultadosFiltrados.map((resultado) => {
              const treinamento = resultado.testes?.modulos?.treinamentos
              
              return (
                <Card key={resultado.id} hover>
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${
                          resultado.aprovado ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Award className={`w-8 h-8 ${
                            resultado.aprovado ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {resultado.testes?.titulo || 'Teste'}
                            </h3>
                            {treinamento?.categoria && (
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded capitalize">
                                {treinamento.categoria}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {treinamento && (
                              <p className="text-sm text-gray-600">
                                <strong>Treinamento:</strong> {treinamento.titulo}
                              </p>
                            )}
                            {resultado.testes?.modulos && (
                              <p className="text-sm text-gray-600">
                                <strong>Módulo:</strong> {resultado.testes.modulos.titulo}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(new Date(resultado.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                              </div>
                              
                              {resultado.tempo_gasto && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{resultado.tempo_gasto} min</span>
                                </div>
                              )}
                              
                              <div>
                                <span className="font-medium">{resultado.acertos}</span>
                                <span className="text-gray-500"> de </span>
                                <span className="font-medium">{resultado.total_questoes}</span>
                                <span className="text-gray-500"> questões corretas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${
                            resultado.aprovado ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {resultado.pontuacao.toFixed(1)}%
                          </p>
                          <p className={`text-sm font-medium ${
                            resultado.aprovado ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {resultado.aprovado ? '✓ Aprovado' : '✗ Reprovado'}
                          </p>
                        </div>
                        
                        {treinamento && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/treinamentos/${treinamento.id}`)}
                          >
                            Ver Treinamento
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

