'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu
} from 'lucide-react'

interface TopbarProps {
  user: {
    nome: string
    email?: string
    role: 'admin' | 'palestrante' | 'aluno'
    avatar_url?: string | null
  }
  onToggleSidebar?: () => void
}

export function Topbar({ user, onToggleSidebar }: TopbarProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  
  const roleLabels = {
    admin: 'Administrador',
    palestrante: 'Palestrante',
    aluno: 'Aluno'
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-border z-40">
      <div className="h-full flex items-center justify-between">
        {/* Logo da DF + Toggle (Esquerda) */}
        <div className="w-64 h-full flex items-center justify-between px-4 border-r border-border">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Abrir/Fechar menu"
            type="button"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <Link href="/dashboard">
            <Image 
              src="/logo.png" 
              alt="DF Corretora" 
              width={140} 
              height={56}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>
        
        {/* Título da página atual */}
        <div className="flex-1 px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo de volta!
          </h1>
          <p className="text-sm text-gray-600">
            Gerencie seus treinamentos e acompanhe seu progresso
          </p>
        </div>
        
        {/* User Dropdown (Direita) */}
        <div className="relative px-8" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.nome}
                className="w-10 h-10 rounded-full border-2 border-primary"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            
            {/* Info */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.nome}</p>
              <p className="text-xs text-gray-500">{roleLabels[user.role]}</p>
            </div>
            
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
              dropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>
          
          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-border py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-gray-900">{user.nome}</p>
                <p className="text-xs text-gray-600 mt-0.5">{user.email || 'Sem e-mail'}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-orange/10 text-orange' 
                      : user.role === 'palestrante'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {roleLabels[user.role]}
                  </span>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/perfil')
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </button>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/configuracoes')
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>
                
                <div className="border-t border-border my-2"></div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

