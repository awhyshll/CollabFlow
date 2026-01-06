import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useBoard } from '../../contexts/BoardContext'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  LayoutDashboard, 
  Kanban, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderKanban
} from 'lucide-react'

function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth()
  const { boards } = useBoard()
  const { isDark } = useTheme()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/boards', icon: FolderKanban, label: 'All Boards' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/chat', icon: MessageSquare, label: 'Team Chat' },
    { to: '/settings', icon: Settings, label: 'Settings' }
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <aside className={`fixed top-0 left-0 h-full transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-20'} ${
      isDark ? 'bg-dark-card text-dark-text' : 'bg-slate-900 text-white'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-dark-border' : 'border-slate-700'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white">
              <Kanban size={24} />
            </div>
            {isOpen && <span className={`font-bold text-xl ${isDark ? 'text-dark-text' : 'text-white'}`}>CollabFlow</span>}
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-border text-dark-text' : 'hover:bg-slate-700 text-white'}`}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-600 text-white' 
                      : isDark 
                        ? 'text-dark-text hover:bg-dark-border' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }
                  `}
                >
                  <item.icon size={20} />
                  {isOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Boards Section */}
          {isOpen && (
            <div className="mt-8">
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-dark-text-secondary' : 'text-slate-400'}`}>
                  Boards
                </h3>
                <button className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-dark-border text-dark-text' : 'hover:bg-slate-700 text-white'}`}>
                  <Plus size={16} />
                </button>
              </div>
              <ul className="space-y-1">
                {boards.slice(0, 5).map(board => (
                  <li key={board.id}>
                    <NavLink
                      to={`/board/${board.id}`}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                        ${isActive 
                          ? isDark ? 'bg-dark-border text-dark-text' : 'bg-slate-700 text-white'
                          : isDark ? 'text-dark-text hover:bg-dark-border' : 'text-slate-300 hover:bg-slate-800'
                        }
                      `}
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: board.color || '#3b82f6' }}
                      />
                      <span className="truncate">{board.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className={`p-4 border-t ${isDark ? 'border-dark-border' : 'border-slate-700'}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors ${
              isDark ? 'text-dark-text hover:bg-dark-border' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
