'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  LayoutDashboard, 
  Trophy, 
  Settings,
  LogOut,
  User
} from 'lucide-react'

interface HeaderProps {
  user: {
    nome: string
    role: 'admin' | 'palestrante' | 'aluno'
    avatar_url?: string | null
  }
  onSignOut: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meus Treinamentos', href: '/meus-treinamentos', icon: BookOpen },
    { name: 'Resultados', href: '/resultados', icon: Trophy },
  ]
  
  const adminNavigation = [
    { name: 'Gerenciar Treinamentos', href: '/admin/treinamentos', icon: Settings },
  ]
  
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">DF Treinamentos</h1>
              <p className="text-xs text-gray-500">DF Corretora</p>
            </div>
          </Link>
          
          {/* Navegação */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    transition-colors text-sm font-medium
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {user.role === 'admin' && adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    transition-colors text-sm font-medium
                    ${isActive 
                      ? 'bg-orange text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.nome}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            
            <div className="flex items-center space-x-2">
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
              
              <button
                onClick={onSignOut}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

