'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Search,
  AlertCircle,
  FileText,
  Settings,
  MoreVertical,
  Upload
} from 'lucide-react'

interface AdminTreinamentosContentProps {
  profile: any
  treinamentos: any[]
}

export function AdminTreinamentosContent({ profile, treinamentos }: AdminTreinamentosContentProps) {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const [busca, setBusca] = useState('')
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [alternando, setAlternando] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  // Manual de Vendas (global)
  const [manualUrl, setManualUrl] = useState<string | null>(null)
  const [uploadingManual, setUploadingManual] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Carregar URL do manual (config)
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
  
  const handleExcluir = async (id: string, titulo: string) => {
    const confirmado = await confirm.confirm({
      title: 'Excluir Treinamento',
      message: `Tem certeza que deseja excluir "${titulo}"?\n\nEsta ação não pode ser desfeita e todos os módulos, slides e testes serão permanentemente removidos.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      variant: 'danger'
    })
    
    if (!confirmado) return
    
    setExcluindo(id)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('treinamentos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Treinamento excluído!', `"${titulo}" foi removido com sucesso`)
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir', error.message || 'Não foi possível excluir o treinamento')
    } finally {
      setExcluindo(null)
    }
  }
  
  const handleAlternarAtivo = async (id: string, ativoAtual: boolean, titulo: string) => {
    setAlternando(id)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('treinamentos')
        .update({ ativo: !ativoAtual })
        .eq('id', id)
      
      if (error) throw error
      
      toast.success(
        ativoAtual ? 'Treinamento desativado' : 'Treinamento ativado',
        `"${titulo}" está agora ${ativoAtual ? 'invisível' : 'visível'} para os alunos`
      )
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status', error.message)
    } finally {
      setAlternando(null)
    }
  }
  
  // Filtrar treinamentos
  const treinamentosFiltrados = treinamentos.filter(t => 
    t.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    t.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    t.categoria?.toLowerCase().includes(busca.toLowerCase())
  )
  
  const totalAtivos = treinamentos.filter(t => t.ativo).length
  const totalInativos = treinamentos.filter(t => !t.ativo).length
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Gerenciar Treinamentos
            </h2>
            <p className="text-gray-600">
              Crie e gerencie os treinamentos da plataforma
            </p>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => router.push('/admin/treinamentos/criar')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Treinamento
          </Button>
        </div>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{treinamentos.length}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{totalAtivos}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-600">{totalInativos}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Manual de Vendas (PDF) - seção fixa */}
        <Card className="mb-8">
          <CardBody className="py-4">
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-gray-900">Manual de Vendas</h3>
                <span className="text-[11px] text-gray-500">PDF · máx 20MB</span>
              </div>
              <div className="flex items-center gap-2">
                {manualUrl && (
                  <Button size="sm" variant="ghost" onClick={() => window.open(manualUrl!, '_blank')}>
                    <FileText className="w-4 h-4 mr-2" /> Abrir
                  </Button>
                )}
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
                    if (file.type !== 'application/pdf') { toast.error('Arquivo inválido', 'Envie um PDF.'); return }
                    if (file.size > 20 * 1024 * 1024) { toast.error('Arquivo muito grande', 'Máximo 20MB.'); return }
                    setUploadingManual(true)
                    try {
                      const supabase = createClient()
                      const path = `manuais/manual-vendas-${Date.now()}.pdf`
                      const { error: upErr } = await supabase.storage
                        .from('apostilas')
                        .upload(path, file, { contentType: 'application/pdf', upsert: true })
                      if (upErr) throw upErr
                      const { data: pub } = await supabase.storage
                        .from('apostilas')
                        .getPublicUrl(path)
                      const { error: upsertErr } = await supabase
                        .from('config')
                        .upsert({ key: 'manual_vendas_url', value: pub.publicUrl }, { onConflict: 'key' })
                      if (upsertErr) throw upsertErr
                      setManualUrl(pub.publicUrl)
                      toast.success('Manual atualizado!', 'PDF publicado.')
                    } catch (err: any) {
                      console.error(err)
                      toast.error('Erro ao publicar manual', err.message || 'Tente novamente')
                    } finally {
                      setUploadingManual(false)
                      setSelectedName('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }
                  }}
                />
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingManual}>
                  <Upload className="w-4 h-4 mr-2" /> {uploadingManual ? 'Enviando...' : 'Enviar PDF'}
                </Button>
              </div>
            </div>
            {selectedName && (
              <p className="text-[11px] text-gray-500 my-1">Selecionado: {selectedName}</p>
            )}
          </CardBody>
        </Card>
 
        {/* Busca */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar treinamentos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* Lista de Treinamentos */}
        {treinamentosFiltrados.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {busca ? 'Nenhum treinamento encontrado' : 'Nenhum treinamento cadastrado'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {treinamentosFiltrados.map((treinamento) => {
              const modulosCount = treinamento.modulos?.[0]?.count || 0
              
              return (
                <Card key={treinamento.id}>
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {treinamento.imagem && (
                          <img
                            src={treinamento.imagem}
                            alt={treinamento.titulo}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {treinamento.titulo}
                            </h3>
                            
                            {treinamento.categoria && (
                              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                                {treinamento.categoria}
                              </span>
                            )}
                            
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              treinamento.ativo 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {treinamento.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          
                          {treinamento.descricao && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {treinamento.descricao}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div>
                              <strong>{modulosCount}</strong> módulo{modulosCount !== 1 ? 's' : ''}
                            </div>
                            {treinamento.duracao && (
                              <div>Duração: <strong>{treinamento.duracao}</strong></div>
                            )}
                            <div className="text-xs text-gray-500">
                              Criado em {new Date(treinamento.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMenuOpenId(menuOpenId === treinamento.id ? null : treinamento.id)}
                          aria-haspopup="menu"
                          aria-expanded={menuOpenId === treinamento.id}
                          title="Mais ações"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        {menuOpenId === treinamento.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-lg z-10 py-2">
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => { setMenuOpenId(null); router.push(`/treinamentos/${treinamento.id}`) }}
                            >
                              <BookOpen className="w-4 h-4" /> Visualizar
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => { setMenuOpenId(null); router.push(`/admin/treinamentos/${treinamento.id}/apostila`) }}
                            >
                              <FileText className="w-4 h-4" /> Apostila (IA)
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => { setMenuOpenId(null); router.push(`/admin/treinamentos/${treinamento.id}/gerenciar`) }}
                            >
                              <Settings className="w-4 h-4" /> Gerenciar conteúdo
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => { setMenuOpenId(null); router.push(`/admin/treinamentos/${treinamento.id}/editar`) }}
                            >
                              <Edit className="w-4 h-4" /> Editar dados
                            </button>
                            <div className="my-2 h-px bg-gray-100" />
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => { setMenuOpenId(null); handleAlternarAtivo(treinamento.id, treinamento.ativo, treinamento.titulo) }}
                              disabled={alternando === treinamento.id}
                            >
                              {treinamento.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {treinamento.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => { setMenuOpenId(null); handleExcluir(treinamento.id, treinamento.titulo) }}
                              disabled={excluindo === treinamento.id}
                            >
                              <Trash2 className="w-4 h-4" /> Excluir
                            </button>
                          </div>
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

