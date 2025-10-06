'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings,
  FileText,
  Users
} from 'lucide-react'

interface SidebarProps {
  userRole: 'admin' | 'palestrante' | 'aluno'
  collapsed: boolean
}

export function Sidebar({ userRole, collapsed }: SidebarProps) {
  const pathname = usePathname()
  
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['admin', 'palestrante', 'aluno']
    },
    { 
      name: 'Meus Treinamentos', 
      href: '/meus-treinamentos', 
      icon: BookOpen,
      roles: ['admin', 'palestrante', 'aluno']
    },
    { 
      name: 'Resultados', 
      href: '/resultados', 
      icon: Trophy,
      roles: ['admin', 'palestrante', 'aluno']
    },
  ]
  
  const adminNavigation = [
    { 
      name: 'Gerenciar Treinamentos', 
      href: '/admin/treinamentos', 
      icon: Settings,
      roles: ['admin']
    },
    { 
      name: 'Relatórios', 
      href: '/admin/relatorios', 
      icon: FileText,
      roles: ['admin']
    },
    { 
      name: 'Usuários', 
      href: '/admin/usuarios', 
      icon: Users,
      roles: ['admin']
    },
  ]
  
  const filteredNav = navigation.filter(item => item.roles.includes(userRole))
  const filteredAdminNav = adminNavigation.filter(item => item.roles.includes(userRole))
  
  return (
    <aside className={`fixed left-0 bg-white border-r border-border flex flex-col transition-all duration-300 ${
      collapsed ? 'w-20 sidebar-collapsed' : 'w-64'
    }`} style={{ top: '80px', height: 'calc(100vh - 80px)' }}>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg
                  transition-colors text-sm font-medium
                  ${collapsed ? 'justify-center' : 'space-x-3'}
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                title={collapsed ? item.name : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
        
        {/* Admin Section */}
        {filteredAdminNav.length > 0 && (
          <div className="mt-8">
            {!collapsed && (
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administração
                </p>
              </div>
            )}
            {collapsed && (
              <div className="border-t border-border mx-3 mb-2"></div>
            )}
            <div className="space-y-1">
              {filteredAdminNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg
                      transition-colors text-sm font-medium
                      ${collapsed ? 'justify-center' : 'space-x-3'}
                      ${isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    title={collapsed ? item.name : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
      
      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-border p-4">
          <p className="text-xs text-gray-500 text-center">
            © 2025 DF Corretora
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Nosso plano é cuidar bem
          </p>
        </div>
      )}
    </aside>
  )
}

