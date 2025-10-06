'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { CheckCircle, Users, UserCog, GraduationCap, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type TipoPerfil = 'aluno' | 'palestrante' | 'admin' | null

export default function CadastroPage() {
  const router = useRouter()
  const toast = useToast()
  
  // Etapa 1: Seleção de tipo
  const [etapa, setEtapa] = useState<'tipo' | 'dados' | 'sucesso'>('tipo')
  const [tipoPerfil, setTipoPerfil] = useState<TipoPerfil>(null)
  
  // Dados do formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cargo, setCargo] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSelecionarTipo = (tipo: TipoPerfil) => {
    setTipoPerfil(tipo)
    setEtapa('dados')
  }
  
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validações
    if (!nome || !email || !senha || !confirmaSenha) {
      toast.warning('Campos vazios', 'Por favor, preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }
    
    if (senha !== confirmaSenha) {
      toast.error('Senhas diferentes', 'As senhas não coincidem')
      setLoading(false)
      return
    }
    
    if (senha.length < 6) {
      toast.warning('Senha muito curta', 'A senha deve ter no mínimo 6 caracteres')
      setLoading(false)
      return
    }
    
    try {
      const supabase = createClient()
      
      // Criar usuário
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            role: tipoPerfil,
            empresa: empresa || null,
            cargo: cargo || null
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      if (data.user) {
        setEtapa('sucesso')
        toast.success('Conta criada!', 'Redirecionando para o login...')
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      
      if (err.message.includes('already registered')) {
        toast.error('E-mail já cadastrado', 'Este e-mail já está em uso. Faça login.')
      } else {
        toast.error('Erro ao criar conta', err.message || 'Tente novamente')
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Etapa 1: Seleção de Tipo
  if (etapa === 'tipo') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-5xl">
          {/* Logo e Título */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <Image 
                src="/logo.png" 
                alt="DF Corretora" 
                width={200} 
                height={80}
                className="h-20 w-auto"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Bem-vindo à DF Treinamentos</h1>
            <p className="text-lg text-gray-600">Escolha o tipo de conta que você deseja criar</p>
          </div>
          
          {/* Cards de Seleção */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Aluno */}
            <Card 
              hover 
              onClick={() => handleSelecionarTipo('aluno')}
              className="cursor-pointer border-2 border-transparent hover:border-primary transition-all group"
            >
              <CardBody className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-10 h-10 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aluno</h3>
                
                <p className="text-gray-600 mb-6 min-h-[60px]">
                  Acesse treinamentos, faça testes e acompanhe seu progresso
                </p>
                
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Acesso a todos os treinamentos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Certificados de conclusão
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Acompanhamento de progresso
                  </li>
                </ul>
                
                <Button fullWidth className="group-hover:bg-primary-dark">
                  Criar como Aluno
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardBody>
            </Card>
            
            {/* Palestrante */}
            <Card 
              hover 
              onClick={() => handleSelecionarTipo('palestrante')}
              className="cursor-pointer border-2 border-transparent hover:border-orange transition-all group"
            >
              <CardBody className="p-8 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-orange" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Palestrante</h3>
                
                <p className="text-gray-600 mb-6 min-h-[60px]">
                  Apresente treinamentos e compartilhe seu conhecimento
                </p>
                
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Apresentar treinamentos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Acompanhar alunos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Modo apresentação
                  </li>
                </ul>
                
                <Button fullWidth variant="secondary" className="group-hover:bg-orange group-hover:text-white">
                  Criar como Palestrante
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardBody>
            </Card>
            
            {/* Admin */}
            <Card 
              hover 
              onClick={() => handleSelecionarTipo('admin')}
              className="cursor-pointer border-2 border-transparent hover:border-purple-600 transition-all group"
            >
              <CardBody className="p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCog className="w-10 h-10 text-purple-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Administrador</h3>
                
                <p className="text-gray-600 mb-6 min-h-[60px]">
                  Gerencie treinamentos, usuários e conteúdos da plataforma
                </p>
                
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Criar treinamentos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Gerenciar usuários
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Relatórios completos
                  </li>
                </ul>
                
                <Button fullWidth variant="secondary" className="group-hover:bg-purple-600 group-hover:text-white">
                  Criar como Admin
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardBody>
            </Card>
          </div>
          
          {/* Link para Login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  // Etapa 2: Formulário de Dados
  if (etapa === 'dados') {
    const tipoLabel = {
      aluno: 'Aluno',
      palestrante: 'Palestrante',
      admin: 'Administrador'
    }[tipoPerfil!]
    
    const tipoIcon = {
      aluno: <GraduationCap className="w-5 h-5" />,
      palestrante: <Users className="w-5 h-5" />,
      admin: <UserCog className="w-5 h-5" />
    }[tipoPerfil!]
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <Image 
                src="/logo.png" 
                alt="DF Corretora" 
                width={180} 
                height={72}
                className="h-16 w-auto"
              />
            </div>
            
            {/* Badge do tipo selecionado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
              {tipoIcon}
              <span className="font-semibold">{tipoLabel}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete seu Cadastro</h1>
            <button 
              onClick={() => setEtapa('tipo')}
              className="text-sm text-gray-600 hover:text-primary hover:underline"
            >
              ← Voltar para seleção de tipo
            </button>
          </div>
          
          {/* Card de Cadastro */}
          <Card>
            <CardBody className="p-8">
              <form onSubmit={handleCadastro} className="space-y-5">
                <Input
                  type="text"
                  label="Nome completo *"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  disabled={loading}
                />
                
                <Input
                  type="email"
                  label="E-mail *"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                
                {/* Campos específicos para Palestrante/Admin */}
                {(tipoPerfil === 'palestrante' || tipoPerfil === 'admin') && (
                  <>
                    <Input
                      type="text"
                      label="Empresa/Organização"
                      placeholder="Nome da empresa"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      disabled={loading}
                    />
                    
                    <Input
                      type="text"
                      label="Cargo"
                      placeholder="Seu cargo"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}
                
                <Input
                  type="password"
                  label="Senha *"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                  helperText="Use no mínimo 6 caracteres"
                />
                
                <Input
                  type="password"
                  label="Confirmar senha *"
                  placeholder="Digite a senha novamente"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  required
                  disabled={loading}
                />
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-gray-500 text-center">
                  Ao criar uma conta, você concorda com os termos de uso da DF Corretora
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }
  
  // Etapa 3: Sucesso
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardBody className="p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Conta Criada com Sucesso!
            </h2>
            
            <p className="text-gray-600 mb-3">
              Sua conta <strong>{tipoPerfil}</strong> foi criada.
            </p>
            
            <p className="text-sm text-gray-500 mb-8">
              Redirecionando para o login...
            </p>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
