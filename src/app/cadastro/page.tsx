'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CadastroPage() {
  const router = useRouter()
  const toast = useToast()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Verifica se o Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast.error('Supabase não configurado', 'Crie o arquivo .env.local')
      setLoading(false)
      return
    }
    
    // Validações
    if (!nome || !email || !senha || !confirmaSenha) {
      toast.warning('Campos vazios', 'Por favor, preencha todos os campos')
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
            role: 'aluno' // Novos usuários sempre começam como aluno
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      if (data.user) {
        setSucesso(true)
        toast.success('Conta criada!', 'Redirecionando para o login...')
        
        // Aguardar 2 segundos e redirecionar para login
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      
      if (err.message.includes('already registered')) {
        toast.error('E-mail já cadastrado', 'Este e-mail já está em uso. Faça login.')
      } else if (err.message.includes('Invalid email')) {
        toast.error('E-mail inválido', 'Verifique o e-mail e tente novamente')
      } else {
        toast.error('Erro ao criar conta', err.message || 'Tente novamente')
      }
    } finally {
      setLoading(false)
    }
  }
  
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardBody className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Conta Criada com Sucesso!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Sua conta foi criada. Redirecionando para o login...
              </p>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">Junte-se à plataforma de treinamentos</p>
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
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-gray-500 text-center">
                Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade da DF Corretora
              </p>
            </div>
          </CardBody>
        </Card>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 DF Corretora - Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}

