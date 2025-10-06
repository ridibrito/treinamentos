'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { 
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Download,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RelatoriosContentProps {
  profile: any
  stats: {
    totalUsuarios: number
    totalTreinamentos: number
    totalTestes: number
  }
  resultados: any[]
}

export function RelatoriosContent({ profile, stats, resultados }: RelatoriosContentProps) {
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  
  // Calcular estatísticas
  const totalAprovados = resultados.filter(r => r.aprovado).length
  const taxaAprovacao = resultados.length > 0 
    ? ((totalAprovados / resultados.length) * 100).toFixed(1)
    : '0.0'
  
  const mediaGeral = resultados.length > 0
    ? (resultados.reduce((acc, r) => acc + r.pontuacao, 0) / resultados.length).toFixed(1)
    : '0.0'
  
  // Agrupar por categoria
  const porCategoria: Record<string, number> = {}
  resultados.forEach(r => {
    const categoria = r.testes?.modulos?.treinamentos?.categoria || 'Sem categoria'
    porCategoria[categoria] = (porCategoria[categoria] || 0) + 1
  })
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Relatórios e Analytics
            </h2>
            <p className="text-gray-600">
              Visualize métricas e desempenho da plataforma
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="all">Todo o período</option>
            </select>
          </div>
        </div>
        
        {/* Cards de Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Treinamentos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTreinamentos}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Testes Realizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTestes}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-green-600">{taxaAprovacao}%</p>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Gráficos e Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Desempenho Geral */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Desempenho Geral</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Média de Notas</span>
                    <span className="font-bold text-primary">{mediaGeral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${mediaGeral}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Taxa de Aprovação</span>
                    <span className="font-bold text-green-600">{taxaAprovacao}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${taxaAprovacao}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{totalAprovados}</p>
                    <p className="text-xs text-gray-600">Aprovados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{resultados.length - totalAprovados}</p>
                    <p className="text-xs text-gray-600">Reprovados</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Por Categoria */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Testes por Categoria</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(porCategoria)
                  .sort(([, a], [, b]) => b - a)
                  .map(([categoria, count]) => {
                    const percentage = ((count / resultados.length) * 100).toFixed(0)
                    return (
                      <div key={categoria}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 capitalize">{categoria}</span>
                          <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                
                {Object.keys(porCategoria).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum teste realizado ainda
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Últimos Resultados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Últimos Resultados</h3>
              <button className="text-sm text-primary hover:underline flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teste</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontuação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resultados.slice(0, 20).map((resultado) => (
                    <tr key={resultado.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {resultado.profiles?.nome || 'Usuário'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {resultado.testes?.titulo || 'Teste'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded capitalize">
                          {resultado.testes?.modulos?.treinamentos?.categoria || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-bold ${
                          resultado.aprovado ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {resultado.pontuacao.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          resultado.aprovado 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {resultado.aprovado ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(resultado.data), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {resultados.length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum resultado registrado ainda</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}

