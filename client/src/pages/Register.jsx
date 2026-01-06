import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Mail, Lock, User, Kanban, Shield, Users, Building, Hash } from 'lucide-react'
import toast from 'react-hot-toast'

function Register() {
  const [searchParams] = useSearchParams()
  const [registerType, setRegisterType] = useState(null) // null, 'admin', or 'member'
  
  // Member fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Admin fields
  const [organizationName, setOrganizationName] = useState('')
  const [adminCode, setAdminCode] = useState('')
  
  const [loading, setLoading] = useState(false)
  const { registerAdmin, registerMember } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  // Check URL params for type
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'admin') {
      setRegisterType('admin')
    }
  }, [searchParams])

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setOrganizationName('')
    setAdminCode('')
  }

  const handleAdminRegister = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setLoading(true)

    try {
      await registerAdmin(email, password, organizationName, adminCode)
      toast.success('Admin account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleMemberRegister = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setLoading(true)

    try {
      await registerMember(email, password, fullName)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  // Role Selection View
  if (registerType === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-gradient-to-br from-primary-600 to-primary-900'}`}>
        <div className={`rounded-2xl shadow-xl w-full max-w-md p-8 ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-xl mb-4">
              <Kanban size={32} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Join CollabFlow</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Choose your account type</p>
          </div>

          {/* Role Selection Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => { setRegisterType('admin'); resetForm(); }}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group hover:border-primary-500 ${isDark ? 'border-dark-border bg-dark-bg hover:bg-dark-border' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Shield size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Register as Admin</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Create & manage your organization</p>
              </div>
            </button>

            <button
              onClick={() => { setRegisterType('member'); resetForm(); }}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group hover:border-primary-500 ${isDark ? 'border-dark-border bg-dark-bg hover:bg-dark-border' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Users size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Register as Member</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Join a team and collaborate</p>
              </div>
            </button>
          </div>

          {/* Login Link */}
          <p className={`text-center mt-8 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Admin Registration Form
  if (registerType === 'admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-gradient-to-br from-primary-600 to-primary-900'}`}>
        <div className={`rounded-2xl shadow-xl w-full max-w-md p-8 ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Registration</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Create your organization account</p>
          </div>

          {/* Admin Form */}
          <form onSubmit={handleAdminRegister} className="space-y-4">
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
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  placeholder="Create your admin code"
                  required
                />
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                Remember this code - you'll need it to sign in
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </form>

          {/* Back Button */}
          <button
            onClick={() => setRegisterType(null)}
            className={`w-full mt-4 py-3 border rounded-lg font-medium transition-colors ${isDark ? 'border-dark-border text-gray-400 hover:bg-dark-border' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            ← Back to role selection
          </button>

          {/* Login Link */}
          <p className={`text-center mt-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Already have an admin account?{' '}
            <Link to="/login" className="text-amber-500 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Member Registration Form
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-gradient-to-br from-primary-600 to-primary-900'}`}>
      <div className={`rounded-2xl shadow-xl w-full max-w-md p-8 ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4">
            <Users size={32} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Create Account</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Join CollabFlow today</p>
        </div>

        {/* Member Form */}
        <form onSubmit={handleMemberRegister} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200 bg-white'}`}
                placeholder="John Doe"
                required
              />
            </div>
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

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={() => setRegisterType(null)}
          className={`w-full mt-4 py-3 border rounded-lg font-medium transition-colors ${isDark ? 'border-dark-border text-gray-400 hover:bg-dark-border' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
        >
          ← Back to role selection
        </button>

        {/* Login Link */}
        <p className={`text-center mt-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
