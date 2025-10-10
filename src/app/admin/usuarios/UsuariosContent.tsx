'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Users,
  Search,
  Shield,
  Award,
  BookOpen,
  Edit,
  UserCheck,
  UserX,
  KeyRound,
  Trash2,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'

interface UsuariosContentProps {
  profile: any
  usuarios: any[]
  progressoData: any[]
  resultadosData: any[]
}

export function UsuariosContent({ 
  profile, 
  usuarios,
  progressoData,
  resultadosData 
}: UsuariosContentProps) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [filtroRole, setFiltroRole] = useState<'todos' | 'admin' | 'palestrante' | 'aluno'>('todos')
  const toast = useToast()
  const { confirm } = useConfirm()

  // Estados de modais
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newNome, setNewNome] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newSenha, setNewSenha] = useState('')
  const [newRole, setNewRole] = useState<'aluno' | 'palestrante' | 'admin'>('aluno')

  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editRole, setEditRole] = useState<'aluno' | 'palestrante' | 'admin'>('aluno')
  
  const roleLabels = {
    admin: 'Administrador',
    palestrante: 'Palestrante',
    aluno: 'Aluno'
  }
  
  // Estatísticas por usuário
  const getUserStats = (userId: string) => {
    const modulosConcluidos = progressoData.filter(p => p.user_id === userId && p.concluido).length
    const resultados = resultadosData.filter(r => r.user_id === userId)
    const mediaNotas = resultados.length > 0
      ? (resultados.reduce((acc, r) => acc + r.pontuacao, 0) / resultados.length).toFixed(0)
      : '0'
    
    return {
      modulosConcluidos,
      testesRealizados: resultados.length,
      mediaNotas: Number(mediaNotas)
    }
  }
  
  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusca = u.nome.toLowerCase().includes(busca.toLowerCase())
    const matchRole = filtroRole === 'todos' || u.role === filtroRole
    return matchBusca && matchRole
  })
  
  // Estatísticas gerais
  const totalAdmins = usuarios.filter(u => u.role === 'admin').length
  const totalPalestrantes = usuarios.filter(u => u.role === 'palestrante').length
  const totalAlunos = usuarios.filter(u => u.role === 'aluno').length
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Usuários
          </h2>
          <p className="text-gray-600">
            Visualize e gerencie os usuários da plataforma
          </p>
        </div>
        
        {/* Estatísticas por Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-orange">{totalAdmins}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Palestrantes</p>
                <p className="text-2xl font-bold text-blue-600">{totalPalestrantes}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alunos</p>
                <p className="text-2xl font-bold text-green-600">{totalAlunos}</p>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Filtros e Ações */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex space-x-2">
            {(['todos', 'admin', 'palestrante', 'aluno'] as const).map(role => (
              <button
                key={role}
                onClick={() => setFiltroRole(role)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filtroRole === role
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-border'
                }`}
              >
                {role === 'todos' ? 'Todos' : roleLabels[role]}
              </button>
            ))}
          </div>

          <div className="sm:ml-auto">
            <Button onClick={() => setIsAddOpen(true)} className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
        </div>
        
        {/* Lista de Usuários */}
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Testes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Média</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usuariosFiltrados.map((usuario) => {
                    const stats = getUserStats(usuario.id)
                    
                    return (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {usuario.avatar_url ? (
                              <img 
                                src={usuario.avatar_url} 
                                alt={usuario.nome}
                                className="w-10 h-10 rounded-full border-2 border-primary"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{usuario.nome}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            usuario.role === 'admin' 
                              ? 'bg-orange/10 text-orange' 
                              : usuario.role === 'palestrante'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {roleLabels[usuario.role as keyof typeof roleLabels]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {stats.modulosConcluidos}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {stats.testesRealizados}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {stats.mediaNotas}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(usuario.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditUserId(usuario.id)
                                setEditNome(usuario.nome)
                                setEditRole(usuario.role)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" /> Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const senha = prompt('Digite a nova senha (mín. 6 caracteres)') || ''
                                if (!senha || senha.length < 6) {
                                  toast.warning('Senha inválida', 'Informe ao menos 6 caracteres')
                                  return
                                }
                                const res = await fetch(`/api/admin/usuarios/${usuario.id}/senha`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ senha })
                                })
                                const data = await res.json()
                                if (!res.ok) {
                                  toast.error('Erro ao alterar senha', data.error || 'Tente novamente')
                                } else {
                                  toast.success('Senha alterada', 'Senha atualizada com sucesso')
                                }
                              }}
                            >
                              <KeyRound className="w-4 h-4 mr-1" /> Senha
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={async () => {
                                const ok = await confirm({
                                  title: 'Excluir usuário?',
                                  message: `Esta ação removerá permanentemente ${usuario.nome}.`,
                                  variant: 'danger',
                                  confirmText: 'Excluir',
                                  cancelText: 'Cancelar'
                                })
                                if (!ok) return
                                const res = await fetch(`/api/admin/usuarios/${usuario.id}`, { method: 'DELETE' })
                                const data = await res.json()
                                if (!res.ok) {
                                  toast.error('Erro ao excluir', data.error || 'Tente novamente')
                                } else {
                                  toast.success('Usuário excluído', `${usuario.nome} foi removido`)
                                  router.refresh()
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" /> Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Modal Adicionar Usuário */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsAddOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-gray-900">Adicionar Usuário</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input className="w-full border border-border rounded-lg px-3 py-2" value={newNome} onChange={(e) => setNewNome(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input className="w-full border border-border rounded-lg px-3 py-2" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha (temporária)</label>
                  <input type="password" className="w-full border border-border rounded-lg px-3 py-2" value={newSenha} onChange={(e) => setNewSenha(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select className="w-full border border-border rounded-lg px-3 py-2" value={newRole} onChange={(e) => setNewRole(e.target.value as any)}>
                    <option value="aluno">Aluno</option>
                    <option value="palestrante">Palestrante</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-gray-50 rounded-b-xl">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button onClick={async () => {
                  if (!newNome || !newEmail) {
                    toast.warning('Dados incompletos', 'Preencha nome e e-mail')
                    return
                  }
                  const res = await fetch('/api/admin/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: newNome, email: newEmail, role: newRole, senha: newSenha })
                  })
                  const data = await res.json()
                  if (!res.ok) {
                    toast.error('Erro ao criar usuário', data.error || 'Tente novamente')
                  } else {
                    toast.success('Usuário criado', 'Conta criada com sucesso')
                    setIsAddOpen(false)
                    setNewNome(''); setNewEmail(''); setNewSenha(''); setNewRole('aluno')
                    router.refresh()
                  }
                }}>Criar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Usuário */}
        {editUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setEditUserId(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-gray-900">Editar Usuário</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input className="w-full border border-border rounded-lg px-3 py-2" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select className="w-full border border-border rounded-lg px-3 py-2" value={editRole} onChange={(e) => setEditRole(e.target.value as any)}>
                    <option value="aluno">Aluno</option>
                    <option value="palestrante">Palestrante</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-gray-50 rounded-b-xl">
                <Button variant="outline" onClick={() => setEditUserId(null)}>Cancelar</Button>
                <Button onClick={async () => {
                  const res = await fetch(`/api/admin/usuarios/${editUserId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: editNome, role: editRole })
                  })
                  const data = await res.json()
                  if (!res.ok) {
                    toast.error('Erro ao salvar', data.error || 'Tente novamente')
                  } else {
                    toast.success('Alterações salvas', 'Usuário atualizado')
                    setEditUserId(null)
                    router.refresh()
                  }
                }}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

