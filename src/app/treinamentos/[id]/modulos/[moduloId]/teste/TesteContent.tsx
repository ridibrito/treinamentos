'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react'

interface TesteContentProps {
  profile: any
  modulo: any
  teste: any
  resultadoAnterior: any
}

export function TesteContent({ 
  profile, 
  modulo, 
  teste,
  resultadoAnterior
}: TesteContentProps) {
  const router = useRouter()
  const [iniciado, setIniciado] = useState(false)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [tempoRestante, setTempoRestante] = useState(teste.tempo_limite * 60 || 0) // em segundos
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  
  // Timer
  useEffect(() => {
    if (!iniciado || !teste.tempo_limite || resultado) return
    
    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleEnviarTeste()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [iniciado, teste.tempo_limite, resultado])
  
  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const handleResposta = (questaoId: string, resposta: string) => {
    setRespostas(prev => ({ ...prev, [questaoId]: resposta }))
  }
  
  const handleEnviarTeste = async () => {
    setEnviando(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Corrigir teste
      let acertos = 0
      let pontosObtidos = 0
      let pontosTotal = 0
      
      for (const questao of teste.questoes) {
        const respostaUsuario = respostas[questao.id]
        const correta = questao.resposta_correta === respostaUsuario
        
        pontosTotal += questao.pontos
        
        if (correta) {
          acertos++
          pontosObtidos += questao.pontos
        }
        
        // Salvar resposta
        await supabase.from('respostas').insert({
          user_id: user.id,
          questao_id: questao.id,
          resposta: respostaUsuario || '',
          correta
        })
      }
      
      const pontuacao = pontosTotal > 0 ? (pontosObtidos / pontosTotal) * 100 : 0
      const aprovado = pontuacao >= teste.nota_minima
      
      const tempoGasto = teste.tempo_limite 
        ? teste.tempo_limite - Math.floor(tempoRestante / 60)
        : null
      
      // Salvar resultado
      const { data: novoResultado } = await supabase
        .from('resultados')
        .insert({
          user_id: user.id,
          teste_id: teste.id,
          pontuacao,
          total_questoes: teste.questoes.length,
          acertos,
          aprovado,
          tempo_gasto: tempoGasto
        })
        .select()
        .single()
      
      setResultado({
        ...novoResultado,
        questoes: teste.questoes.map((q: any) => ({
          ...q,
          respostaUsuario: respostas[q.id],
          correta: q.resposta_correta === respostas[q.id]
        }))
      })
    } catch (error) {
      console.error('Erro ao enviar teste:', error)
      alert('Erro ao enviar teste. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }
  
  // Se já fez o teste, mostrar resultado anterior
  if (resultadoAnterior && !resultado) {
    return (
      <AppLayout user={profile}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push(`/treinamentos/${modulo.treinamento_id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Treinamento</span>
          </button>
          
          <Card>
            <CardBody className="text-center p-12">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                resultadoAnterior.aprovado ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Award className={`w-12 h-12 ${
                  resultadoAnterior.aprovado ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Você já realizou este teste
              </h1>
              
              <div className="mb-8">
                <p className={`text-5xl font-bold mb-2 ${
                  resultadoAnterior.aprovado ? 'text-green-600' : 'text-red-600'
                }`}>
                  {resultadoAnterior.pontuacao.toFixed(1)}%
                </p>
                <p className="text-gray-600">
                  {resultadoAnterior.acertos} de {resultadoAnterior.total_questoes} questões corretas
                </p>
                <p className={`mt-2 font-medium ${
                  resultadoAnterior.aprovado ? 'text-green-600' : 'text-red-600'
                }`}>
                  {resultadoAnterior.aprovado ? '✓ Aprovado' : '✗ Reprovado'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/treinamentos/${modulo.treinamento_id}`)}
                >
                  Voltar ao Treinamento
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIniciado(true)}
                >
                  Refazer Teste
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    )
  }
  
  // Mostrar resultado após enviar
  if (resultado) {
    return (
      <AppLayout user={profile}>
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardBody className="text-center p-12">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                resultado.aprovado ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Award className={`w-12 h-12 ${
                  resultado.aprovado ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Teste Concluído!
              </h1>
              
              <div className="mb-8">
                <p className={`text-5xl font-bold mb-2 ${
                  resultado.aprovado ? 'text-green-600' : 'text-red-600'
                }`}>
                  {resultado.pontuacao.toFixed(1)}%
                </p>
                <p className="text-gray-600">
                  {resultado.acertos} de {resultado.total_questoes} questões corretas
                </p>
                <p className={`mt-2 text-lg font-medium ${
                  resultado.aprovado ? 'text-green-600' : 'text-red-600'
                }`}>
                  {resultado.aprovado ? '✓ Aprovado' : '✗ Reprovado'}
                </p>
              </div>
              
              {resultado.aprovado ? (
                <p className="text-gray-600 mb-6">
                  Parabéns! Você demonstrou domínio sobre o conteúdo do módulo.
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  Revise o conteúdo do módulo e tente novamente para melhorar sua pontuação.
                </p>
              )}
              
              <Button
                variant="primary"
                onClick={() => router.push(`/treinamentos/${modulo.treinamento_id}`)}
              >
                Voltar ao Treinamento
              </Button>
            </CardBody>
          </Card>
          
          {/* Revisão das Respostas */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Revisão das Respostas</h2>
            </CardHeader>
            <CardBody className="divide-y divide-border">
              {resultado.questoes.map((questao: any, index: number) => (
                <div key={questao.id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex items-start space-x-3 mb-3">
                    {questao.correta ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        {index + 1}. {questao.enunciado}
                      </p>
                      
                      {questao.tipo === 'multipla' && questao.alternativas && (
                        <div className="space-y-2">
                          {(questao.alternativas as any[]).map((alt: any) => {
                            const isResposta = alt.id === questao.respostaUsuario
                            const isCorreta = alt.id === questao.resposta_correta
                            
                            return (
                              <div
                                key={alt.id}
                                className={`p-3 rounded-lg border ${
                                  isCorreta 
                                    ? 'bg-green-50 border-green-300' 
                                    : isResposta 
                                    ? 'bg-red-50 border-red-300' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <span className="font-medium">{alt.id.toUpperCase()}) </span>
                                {alt.texto}
                                {isCorreta && <span className="ml-2 text-green-600">✓</span>}
                                {isResposta && !isCorreta && <span className="ml-2 text-red-600">✗</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {questao.tipo === 'vf' && (
                        <div className="space-y-2">
                          <div className={`p-3 rounded-lg border ${
                            questao.resposta_correta === 'true' 
                              ? 'bg-green-50 border-green-300' 
                              : questao.respostaUsuario === 'true' 
                              ? 'bg-red-50 border-red-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            Verdadeiro
                            {questao.resposta_correta === 'true' && <span className="ml-2 text-green-600">✓</span>}
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            questao.resposta_correta === 'false' 
                              ? 'bg-green-50 border-green-300' 
                              : questao.respostaUsuario === 'false' 
                              ? 'bg-red-50 border-red-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            Falso
                            {questao.resposta_correta === 'false' && <span className="ml-2 text-green-600">✓</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    )
  }
  
  // Tela inicial do teste
  if (!iniciado) {
    return (
      <AppLayout user={profile}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push(`/treinamentos/${modulo.treinamento_id}/modulos/${modulo.id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Módulo</span>
          </button>
          
          <Card>
            <CardBody className="p-12 text-center">
              <div className="w-20 h-20 bg-orange/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-orange" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {teste.titulo}
              </h1>
              
              {teste.descricao && (
                <p className="text-gray-600 mb-8">{teste.descricao}</p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-left">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Questões</p>
                  <p className="text-2xl font-bold text-gray-900">{teste.questoes.length}</p>
                </div>
                
                {teste.tempo_limite && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tempo Limite</p>
                    <p className="text-2xl font-bold text-gray-900">{teste.tempo_limite} min</p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Nota Mínima</p>
                  <p className="text-2xl font-bold text-gray-900">{teste.nota_minima}%</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Após iniciar, você não poderá pausar o teste.
                  {teste.tempo_limite && ' O tempo começará a contar imediatamente.'}
                </p>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIniciado(true)}
              >
                Iniciar Teste
              </Button>
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    )
  }
  
  // Questionário
  const todasRespondidas = teste.questoes.every((q: any) => respostas[q.id])
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-4xl mx-auto">
        {/* Timer */}
        {teste.tempo_limite > 0 && (
          <Card className="mb-6">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange" />
                  <span className="text-sm text-gray-600">Tempo Restante:</span>
                </div>
                <span className={`text-2xl font-bold ${
                  tempoRestante < 60 ? 'text-red-600' : 'text-primary'
                }`}>
                  {formatarTempo(tempoRestante)}
                </span>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Questões */}
        <div className="space-y-6 mb-8">
          {teste.questoes.map((questao: any, index: number) => (
            <Card key={questao.id}>
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {index + 1}. {questao.enunciado}
                </h3>
                
                {questao.tipo === 'multipla' && questao.alternativas && (
                  <div className="space-y-3">
                    {(questao.alternativas as any[]).map((alternativa: any) => (
                      <label
                        key={alternativa.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          respostas[questao.id] === alternativa.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={questao.id}
                          value={alternativa.id}
                          checked={respostas[questao.id] === alternativa.id}
                          onChange={() => handleResposta(questao.id, alternativa.id)}
                          className="mt-1"
                        />
                        <span className="flex-1">
                          <strong>{alternativa.id.toUpperCase()}) </strong>
                          {alternativa.texto}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                
                {questao.tipo === 'vf' && (
                  <div className="space-y-3">
                    <label
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        respostas[questao.id] === 'true'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={questao.id}
                        value="true"
                        checked={respostas[questao.id] === 'true'}
                        onChange={() => handleResposta(questao.id, 'true')}
                      />
                      <span>Verdadeiro</span>
                    </label>
                    
                    <label
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        respostas[questao.id] === 'false'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={questao.id}
                        value="false"
                        checked={respostas[questao.id] === 'false'}
                        onChange={() => handleResposta(questao.id, 'false')}
                      />
                      <span>Falso</span>
                    </label>
                  </div>
                )}
                
                {questao.tipo === 'dissertativa' && (
                  <textarea
                    value={respostas[questao.id] || ''}
                    onChange={(e) => handleResposta(questao.id, e.target.value)}
                    className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                    placeholder="Digite sua resposta..."
                  />
                )}
              </CardBody>
            </Card>
          ))}
        </div>
        
        {/* Botão Enviar */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {Object.keys(respostas).length} de {teste.questoes.length} questões respondidas
                </p>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleEnviarTeste}
                disabled={!todasRespondidas || enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar Teste'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}

