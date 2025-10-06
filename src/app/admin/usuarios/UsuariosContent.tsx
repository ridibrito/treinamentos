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
  UserX
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
        
        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
      </div>
    </AppLayout>
  )
}

