'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BookOpen, 
  Clock, 
  TrendingUp,
  Play,
  CheckCircle,
  Award,
  Search,
  Filter
} from 'lucide-react'
const MANUAL_VENDAS_URL = process.env.NEXT_PUBLIC_MANUAL_VENDAS_URL
import { createClient } from '@/lib/supabase/client'

interface DashboardContentProps {
  profile: any
  treinamentos: any[]
  progresso: any[]
  resultados: any[]
}

export function DashboardContent({ 
  profile, 
  treinamentos, 
  progresso, 
  resultados 
}: DashboardContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [busca, setBusca] = useState('')
  const [manualUrl, setManualUrl] = useState<string | null>(MANUAL_VENDAS_URL || null)
  const [manualUpdatedAt, setManualUpdatedAt] = useState<string | null>(null)
  
  // Ler busca da URL
  useEffect(() => {
    const buscaURL = searchParams.get('busca')
    if (buscaURL) {
      setBusca(buscaURL)
    }
  }, [searchParams])

  // Carregar URL do manual via config
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('config')
          .select('value, updated_at')
          .eq('key', 'manual_vendas_url')
          .single()
        if (data?.value) setManualUrl(data.value)
        if (data?.updated_at) setManualUpdatedAt(new Date(data.updated_at).toLocaleDateString('pt-BR'))
      } catch {}
    })()
  }, [])
  
  // Calcular progresso por treinamento
  const calcularProgresso = (treinamentoId: string) => {
    const modulosTreinamento = treinamentos.find(t => t.id === treinamentoId)?.modulos?.[0]?.count || 0
    const modulosConcluidos = progresso.filter(
      p => p.treinamento_id === treinamentoId && p.concluido
    ).length
    
    if (modulosTreinamento === 0) return 0
    return Math.round((modulosConcluidos / modulosTreinamento) * 100)
  }
  
  // Filtrar treinamentos
  const treinamentosFiltrados = treinamentos.filter(t => {
    const matchCategoria = filtroCategoria === 'todas' || t.categoria === filtroCategoria
    const matchBusca = t.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       t.descricao?.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })
  
  // Categorias únicas
  const categorias = ['todas', ...Array.from(new Set(treinamentos.map(t => t.categoria).filter(Boolean)))]
  
  // Estatísticas Expandidas
  const totalTreinamentos = treinamentos.length
  const treinamentosEmAndamento = new Set(progresso.filter(p => !p.concluido).map(p => p.treinamento_id)).size
  const treinamentosConcluidos = new Set(progresso.filter(p => p.concluido).map(p => p.treinamento_id)).size
  const mediaNotas = resultados.length > 0 
    ? (resultados.reduce((acc, r) => acc + r.pontuacao, 0) / resultados.length).toFixed(1)
    : '0.0'
  
  // Novas métricas
  const totalModulosConcluidos = progresso.filter(p => p.concluido).length
  const totalTestes = resultados.length
  const testesAprovados = resultados.filter(r => r.pontuacao >= 70).length
  const horasEstudadas = Math.round(totalModulosConcluidos * 0.5) // Estima 30min por módulo
  const proximoCertificado = treinamentos.find(t => {
    const prog = calcularProgresso(t.id)
    return prog > 50 && prog < 100
  })
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        {/* Boas-vindas */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {profile.nome}! 👋
          </h2>
          <p className="text-gray-600">
            Aqui está um resumo da sua jornada de aprendizado
          </p>
        </div>
        
        {/* Cards de Estatísticas Melhorados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Horas Estudadas */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                  +{Math.round(horasEstudadas * 0.15)}h este mês
                </span>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Horas Estudadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{horasEstudadas}h</p>
              <p className="text-xs text-gray-600 mt-2">{totalModulosConcluidos} módulos concluídos</p>
            </CardBody>
          </Card>
          
          {/* Média de Notas */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-yellow-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Award className="w-6 h-6 text-white" />
                </div>
                {parseFloat(mediaNotas) >= 80 && (
                  <span className="text-xs text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded-full">
                    Excelente!
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Média de Notas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{mediaNotas}%</p>
              <p className="text-xs text-gray-600 mt-2">{testesAprovados} de {totalTestes} aprovados</p>
            </CardBody>
          </Card>
          
          {/* Concluídos */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-green-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                {treinamentosConcluidos > 0 && (
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                    🎉 Parabéns!
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Concluídos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{treinamentosConcluidos}</p>
              <p className="text-xs text-gray-600 mt-2">de {totalTreinamentos} disponíveis</p>
            </CardBody>
          </Card>
          
          {/* Em Andamento */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                {proximoCertificado && (
                  <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                    Quase lá!
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Em Andamento</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{treinamentosEmAndamento}</p>
              {proximoCertificado ? (
                <p className="text-xs text-purple-600 mt-2 font-medium">
                  {calcularProgresso(proximoCertificado.id)}% em {proximoCertificado.titulo.substring(0, 20)}...
                </p>
              ) : (
                <p className="text-xs text-gray-600 mt-2">Continue estudando!</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Manual de Vendas - Acesso Rápido */}
        <div className="mb-8">
          <Card>
            <CardBody className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-gray-900">Manual de Vendas</h3>
                  {manualUpdatedAt && (
                    <span className="text-[11px] text-gray-500">Atualizado em {manualUpdatedAt}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (manualUrl) window.open(manualUrl, '_blank')
                    else alert('Manual não configurado. Faça upload em Admin > Treinamentos > Gerenciar (Manual de Vendas).')
                  }}
                >
                  Baixar PDF
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar treinamentos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary capitalize"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Lista de Treinamentos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Treinamentos Disponíveis
          </h2>
          
          {treinamentosFiltrados.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum treinamento encontrado</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treinamentosFiltrados.map((treinamento) => {
                const progressoPerc = calcularProgresso(treinamento.id)
                const modulosCount = treinamento.modulos?.[0]?.count || 0
                
                return (
                  <Card key={treinamento.id} hover>
                    {treinamento.imagem && (
                      <div className="h-48 overflow-hidden rounded-t-xl">
                        <img
                          src={treinamento.imagem}
                          alt={treinamento.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardBody>
                      <div className="mb-3">
                        {treinamento.categoria && (
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize mb-3">
                            {treinamento.categoria}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {treinamento.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {treinamento.descricao || 'Sem descrição disponível'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{modulosCount} módulo{modulosCount !== 1 ? 's' : ''}</span>
                        </div>
                        {treinamento.duracao && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{treinamento.duracao}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Barra de Progresso Visual */}
                      {progressoPerc > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Progresso</span>
                            <span className="text-xs font-bold text-primary">{progressoPerc}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-500"
                              style={{ width: `${progressoPerc}%` }}
                            />
                          </div>
                          {progressoPerc === 100 && (
                            <div className="flex items-center gap-1 mt-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-600 font-semibold">Completado!</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button
                        variant={progressoPerc > 0 ? 'secondary' : 'primary'}
                        fullWidth
                        onClick={() => router.push(`/treinamentos/${treinamento.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {progressoPerc === 100 ? 'Revisar' : progressoPerc > 0 ? 'Continuar' : 'Iniciar'}
                      </Button>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Últimos Resultados */}
        {resultados.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Últimos Resultados
            </h2>
            
            <Card>
              <CardBody className="p-0">
                <div className="divide-y divide-border">
                  {resultados.map((resultado) => (
                    <div key={resultado.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          resultado.aprovado ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Award className={`w-6 h-6 ${
                            resultado.aprovado ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {resultado.testes?.titulo || 'Teste'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {resultado.acertos} de {resultado.total_questoes} questões corretas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          resultado.aprovado ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {resultado.pontuacao.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(resultado.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

