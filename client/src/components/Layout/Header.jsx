import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Menu, Bell, Search, User, Sun, Moon } from 'lucide-react'

function Header({ toggleSidebar }) {
  const { user, userProfile } = useAuth()
  const { connected } = useSocket()
  const { toggleTheme, isDark } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className={`border-b px-6 py-4 transition-colors duration-300 ${
      isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors lg:hidden ${
              isDark ? 'hover:bg-dark-border text-dark-text' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Menu size={20} />
          </button>
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-dark-text-secondary' : 'text-slate-400'
            }`} size={18} />
            <input
              type="text"
              placeholder="Search tasks, boards..."
              className={`pl-10 pr-4 py-2 w-80 border-0 rounded-lg transition-all ${
                isDark 
                  ? 'bg-dark-border text-dark-text placeholder-dark-text-secondary focus:ring-2 focus:ring-primary-500' 
                  : 'bg-gray-300 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:bg-gray-100'
              }`}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-dark-border text-dark-text' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`hidden sm:inline ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg transition-colors relative ${
                isDark ? 'hover:bg-dark-border text-dark-text' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border py-2 z-50 ${
                isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'
              }`}>
                <div className={`px-4 py-2 border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
                  <h3 className={`font-semibold ${isDark ? 'text-dark-text' : 'text-slate-800'}`}>Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className={`px-4 py-3 cursor-pointer ${isDark ? 'hover:bg-dark-border' : 'hover:bg-slate-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>No new notifications</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-dark-border' : 'hover:bg-slate-100'
              }`}
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white">
                {userProfile?.displayName?.[0]?.toUpperCase() || <User size={16} />}
              </div>
              <span className={`font-medium hidden sm:inline ${isDark ? 'text-dark-text' : 'text-slate-700'}`}>
                {userProfile?.displayName || user?.email}
              </span>
            </button>

            {showProfile && (
              <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border py-2 z-50 ${
                isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'
              }`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
                  <p className={`font-semibold ${isDark ? 'text-dark-text' : 'text-slate-800'}`}>{userProfile?.displayName}</p>
                  <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>{user?.email}</p>
                </div>
                <a href="/settings" className={`block px-4 py-2 text-sm ${
                  isDark ? 'hover:bg-dark-border text-dark-text' : 'hover:bg-slate-50 text-slate-700'
                }`}>
                  Settings
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
