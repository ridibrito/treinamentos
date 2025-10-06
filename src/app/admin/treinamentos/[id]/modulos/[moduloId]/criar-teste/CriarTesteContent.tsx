'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  CheckCircle2,
  XCircle,
  GripVertical,
  Clock,
  Award
} from 'lucide-react'

interface CriarTesteContentProps {
  profile: any
  modulo: any
  treinamentoId: string
  testeExistenteId?: string
}

type TipoQuestao = 'multipla' | 'vf' | 'dissertativa'

interface Alternativa {
  id: string
  texto: string
}

interface Questao {
  id: string
  enunciado: string
  tipo: TipoQuestao
  alternativas: Alternativa[]
  resposta_correta: string
  ordem: number
  pontos: number
}

export default function CriarTesteContent({ 
  profile, 
  modulo, 
  treinamentoId,
  testeExistenteId 
}: CriarTesteContentProps) {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  
  const [titulo, setTitulo] = useState('Avaliação - ' + modulo.titulo)
  const [descricao, setDescricao] = useState('Teste seus conhecimentos sobre ' + modulo.titulo)
  const [tempoLimite, setTempoLimite] = useState(15)
  const [notaMinima, setNotaMinima] = useState(70)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [salvando, setSalvando] = useState(false)
  
  const handleAddQuestao = (tipo: TipoQuestao) => {
    const novaQuestao: Questao = {
      id: Math.random().toString(36).substr(2, 9),
      enunciado: '',
      tipo,
      alternativas: tipo === 'multipla' 
        ? [
            { id: 'a', texto: '' },
            { id: 'b', texto: '' },
            { id: 'c', texto: '' },
            { id: 'd', texto: '' }
          ]
        : tipo === 'vf'
        ? [
            { id: 'true', texto: 'Verdadeiro' },
            { id: 'false', texto: 'Falso' }
          ]
        : [],
      resposta_correta: tipo === 'multipla' ? 'a' : tipo === 'vf' ? 'true' : '',
      ordem: questoes.length + 1,
      pontos: 1.0
    }
    setQuestoes([...questoes, novaQuestao])
  }
  
  const handleRemoveQuestao = async (id: string) => {
    const confirmado = await confirm({
      title: 'Remover Questão',
      message: 'Tem certeza que deseja remover esta questão?',
      variant: 'danger'
    })
    
    if (confirmado) {
      setQuestoes(questoes.filter(q => q.id !== id))
      toast.success('Questão removida!')
    }
  }
  
  const handleUpdateQuestao = (id: string, field: string, value: any) => {
    setQuestoes(questoes.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }
  
  const handleUpdateAlternativa = (questaoId: string, altId: string, texto: string) => {
    setQuestoes(questoes.map(q => {
      if (q.id === questaoId) {
        return {
          ...q,
          alternativas: q.alternativas.map(a =>
            a.id === altId ? { ...a, texto } : a
          )
        }
      }
      return q
    }))
  }
  
  const handleSalvar = async () => {
    // Validações
    if (!titulo.trim()) {
      toast.warning('Título obrigatório', 'Por favor, informe o título do teste')
      return
    }
    
    if (questoes.length === 0) {
      toast.warning('Adicione questões', 'O teste precisa ter pelo menos 1 questão')
      return
    }
    
    // Validar cada questão
    for (const q of questoes) {
      if (!q.enunciado.trim()) {
        toast.warning('Enunciado vazio', `A questão ${q.ordem} precisa de um enunciado`)
        return
      }
      
      if (q.tipo === 'multipla') {
        const alternativasVazias = q.alternativas.filter(a => !a.texto.trim())
        if (alternativasVazias.length > 0) {
          toast.warning('Alternativas vazias', `Preencha todas as alternativas da questão ${q.ordem}`)
          return
        }
      }
      
      if (!q.resposta_correta) {
        toast.warning('Resposta não definida', `Defina a resposta correta da questão ${q.ordem}`)
        return
      }
    }
    
    setSalvando(true)
    
    try {
      const supabase = createClient()
      
      // Criar teste
      const { data: teste, error: testeError } = await supabase
        .from('testes')
        .insert({
          modulo_id: modulo.id,
          titulo,
          descricao,
          tempo_limite: tempoLimite,
          nota_minima: notaMinima
        })
        .select()
        .single()
      
      if (testeError) throw testeError
      
      // Criar questões
      const questoesParaInserir = questoes.map(q => ({
        teste_id: teste.id,
        enunciado: q.enunciado,
        tipo: q.tipo,
        alternativas: q.tipo !== 'dissertativa' ? q.alternativas : null,
        resposta_correta: q.resposta_correta,
        ordem: q.ordem,
        pontos: q.pontos
      }))
      
      const { error: questoesError } = await supabase
        .from('questoes')
        .insert(questoesParaInserir)
      
      if (questoesError) throw questoesError
      
      toast.success('Teste criado!', `${questoes.length} questões adicionadas com sucesso`)
      
      setTimeout(() => {
        router.push(`/admin/treinamentos/${treinamentoId}`)
      }, 1500)
      
    } catch (error: any) {
      console.error('Erro ao salvar teste:', error)
      toast.error('Erro ao salvar', error.message)
    } finally {
      setSalvando(false)
    }
  }
  
  const totalPontos = questoes.reduce((sum, q) => sum + q.pontos, 0)
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {testeExistenteId ? 'Editar Teste' : 'Criar Teste'}
          </h1>
          <p className="text-gray-600">
            Módulo: <span className="font-medium">{modulo.titulo}</span>
          </p>
        </div>
        
        {testeExistenteId && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Este módulo já possui um teste. Ao salvar, você irá substituí-lo.
            </p>
          </div>
        )}
        
        {/* Configurações do Teste */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold">Configurações do Teste</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Título do Teste *"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Avaliação Final"
              />
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    label="Tempo Limite (min)"
                    value={tempoLimite.toString()}
                    onChange={(e) => setTempoLimite(parseInt(e.target.value) || 0)}
                    min={0}
                    icon={<Clock className="w-4 h-4" />}
                  />
                </div>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    label="Nota Mínima (%)"
                    value={notaMinima.toString()}
                    onChange={(e) => setNotaMinima(parseFloat(e.target.value) || 70)}
                    min={0}
                    max={100}
                    icon={<Award className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Descrição opcional do teste"
              />
            </div>
          </CardBody>
        </Card>
        
        {/* Questões */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Questões</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {questoes.length} questões · {totalPontos.toFixed(1)} pontos totais
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddQuestao('multipla')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Múltipla Escolha
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddQuestao('vf')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  V ou F
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddQuestao('dissertativa')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Dissertativa
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardBody>
            {questoes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhuma questão adicionada ainda</p>
                <p className="text-sm text-gray-400">
                  Clique em um dos botões acima para adicionar uma questão
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {questoes.map((questao, index) => (
                  <div key={questao.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    {/* Header da Questão */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="text-sm font-semibold text-primary">
                            Questão {index + 1}
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 bg-white border border-gray-300 rounded-full">
                            {questao.tipo === 'multipla' ? 'Múltipla Escolha' : 
                             questao.tipo === 'vf' ? 'Verdadeiro ou Falso' : 
                             'Dissertativa'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={questao.pontos.toString()}
                          onChange={(e) => handleUpdateQuestao(questao.id, 'pontos', parseFloat(e.target.value) || 1)}
                          className="w-20"
                          step={0.5}
                          min={0.5}
                          placeholder="Pts"
                        />
                        <button
                          onClick={() => handleRemoveQuestao(questao.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Enunciado */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enunciado *
                      </label>
                      <textarea
                        value={questao.enunciado}
                        onChange={(e) => handleUpdateQuestao(questao.id, 'enunciado', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Digite a pergunta..."
                      />
                    </div>
                    
                    {/* Múltipla Escolha */}
                    {questao.tipo === 'multipla' && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Alternativas * (marque a correta)
                        </label>
                        
                        {questao.alternativas.map((alt) => (
                          <div key={alt.id} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`questao-${questao.id}`}
                              checked={questao.resposta_correta === alt.id}
                              onChange={() => handleUpdateQuestao(questao.id, 'resposta_correta', alt.id)}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm font-medium text-gray-700 w-8">
                                {alt.id.toUpperCase()})
                              </span>
                              <input
                                type="text"
                                value={alt.texto}
                                onChange={(e) => handleUpdateAlternativa(questao.id, alt.id, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                placeholder={`Alternativa ${alt.id.toUpperCase()}`}
                              />
                            </div>
                            {questao.resposta_correta === alt.id && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Verdadeiro ou Falso */}
                    {questao.tipo === 'vf' && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Resposta Correta *
                        </label>
                        
                        <div className="flex gap-4">
                          <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors flex-1">
                            <input
                              type="radio"
                              name={`questao-${questao.id}`}
                              checked={questao.resposta_correta === 'true'}
                              onChange={() => handleUpdateQuestao(questao.id, 'resposta_correta', 'true')}
                              className="w-4 h-4 text-green-600"
                            />
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Verdadeiro</span>
                          </label>
                          
                          <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-red-50 transition-colors flex-1">
                            <input
                              type="radio"
                              name={`questao-${questao.id}`}
                              checked={questao.resposta_correta === 'false'}
                              onChange={() => handleUpdateQuestao(questao.id, 'resposta_correta', 'false')}
                              className="w-4 h-4 text-red-600"
                            />
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-medium">Falso</span>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {/* Dissertativa */}
                    {questao.tipo === 'dissertativa' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          💡 <strong>Questões dissertativas</strong> precisam ser corrigidas manualmente.
                          Os alunos poderão digitar uma resposta em texto livre.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            onClick={handleSalvar}
            disabled={salvando || questoes.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            {salvando ? 'Salvando...' : 'Salvar Teste'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}

