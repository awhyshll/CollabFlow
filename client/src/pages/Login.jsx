import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Mail, Lock, Kanban, Shield, Users, Building, Hash } from 'lucide-react'
import toast from 'react-hot-toast'

function Login() {
  const [loginType, setLoginType] = useState(null) // null, 'admin', or 'member'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamCode, setTeamCode] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginAdmin, loginMember } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await loginAdmin(email, password, organizationName, adminCode)
      toast.success('Welcome back, Admin!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleMemberSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await loginMember(email, password, teamCode)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setTeamCode('')
    setAdminCode('')
    setOrganizationName('')
  }

  // Role Selection View
  if (loginType === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-gradient-to-br from-primary-600 to-primary-900'}`}>
        <div className={`rounded-2xl shadow-xl w-full max-w-md p-8 ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-xl mb-4">
              <Kanban size={32} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Welcome to CollabFlow</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Choose how you want to sign in</p>
          </div>

          {/* Role Selection Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => { setLoginType('admin'); resetForm(); }}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group hover:border-primary-500 ${isDark ? 'border-dark-border bg-dark-bg hover:bg-dark-border' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Shield size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Team Admin</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Manage teams, boards & members</p>
              </div>
            </button>

            <button
              onClick={() => { setLoginType('member'); resetForm(); }}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group hover:border-primary-500 ${isDark ? 'border-dark-border bg-dark-bg hover:bg-dark-border' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Users size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Team Member</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Collaborate on tasks & projects</p>
              </div>
            </button>
          </div>

          {/* Register Link */}
          <p className={`text-center mt-8 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Admin Login Form
  if (loginType === 'admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-gradient-to-br from-primary-600 to-primary-900'}`}>
        <div className={`rounded-2xl shadow-xl w-full max-w-md p-8 ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Sign In</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Access your organization dashboard</p>
          </div>

          {/* Admin Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Organization Name
              </label>
              <div className="relative">
                <Building className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                  placeholder="Your Company Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Admin Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                  placeholder="admin@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Admin Access Code
              </label>
              <div className="relative">
                <Hash className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                  placeholder="Enter admin code"
                  required
                />
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                Provided by your organization
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          {/* Back Button */}
          <button
            onClick={() => setLoginType(null)}
            className={`w-full mt-4 py-3 border rounded-lg font-medium transition-colors ${isDark ? 'border-dark-border text-gray-400 hover:bg-dark-border' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            ← Back to role selection
          </button>

          {/* Register Link */}
          <p className={`text-center mt-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Need an admin account?{' '}
            <Link to="/register?type=admin" className="text-amber-500 hover:underline font-medium">
              Register as Admin
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Member Login Form
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-gradient-to-br from-primary-600 to-primary-900'}`}>
      <div className={`rounded-2xl shadow-xl w-full max-w-md p-8 ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4">
            <Users size={32} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Member Sign In</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Join your team workspace</p>
        </div>

        {/* Member Form */}
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Team Code
            </label>
            <div className="relative">
              <Hash className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-wider ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                placeholder="TEAM-XXXX"
                required
              />
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
              Get this code from your team admin
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In as Member'}
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={() => setLoginType(null)}
          className={`w-full mt-4 py-3 border rounded-lg font-medium transition-colors ${isDark ? 'border-dark-border text-gray-400 hover:bg-dark-border' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
        >
          ← Back to role selection
        </button>

        {/* Register Link */}
        <p className={`text-center mt-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
