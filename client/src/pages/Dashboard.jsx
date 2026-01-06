import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useBoard } from '../contexts/BoardContext'
import { useTheme } from '../contexts/ThemeContext'
import { Plus, Kanban, Users, Clock, TrendingUp, Calendar, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

function Dashboard() {
  const { userProfile } = useAuth()
  const { boards, createBoard, tasks } = useBoard()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newBoardTitle.trim()) return

    setCreating(true)
    try {
      const boardId = await createBoard({
        title: newBoardTitle,
        description: newBoardDescription,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      })
      toast.success('Board created!')
      setNewBoardTitle('')
      setNewBoardDescription('')
      setShowCreateModal(false)
      navigate(`/board/${boardId}`)
    } catch (error) {
      console.error('Error creating board:', error)
      toast.error('Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  const stats = [
    { 
      label: 'Total Boards', 
      value: boards.length, 
      icon: Kanban, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total Tasks', 
      value: tasks.length, 
      icon: Clock, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Team Members', 
      value: '1', 
      icon: Users, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Completed', 
      value: tasks.filter(t => t.status === 'done').length || '0', 
      icon: TrendingUp, 
      color: 'bg-orange-500' 
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userProfile?.displayName || 'User'}! 👋
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`rounded-xl p-6 shadow-sm border transition-colors ${
            isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
            <h3 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-slate-800'}`}>{stat.value}</h3>
            <p className={isDark ? 'text-dark-text-secondary' : 'text-slate-500'}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Boards Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-slate-800'}`}>Your Boards</h2>
          <div className="flex items-center gap-3">
            {boards.length > 0 && (
              <button
                onClick={() => navigate('/boards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-dark-border text-dark-text hover:bg-dark-card' 
                    : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                }`}
              >
                <Kanban size={18} />
                View All Boards
                <ArrowRight size={16} />
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              New Board
            </button>
          </div>
        </div>

        {boards.length === 0 ? (
          <div className={`rounded-xl p-12 text-center border transition-colors ${
            isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark ? 'bg-dark-border' : 'bg-slate-100'
            }`}>
              <Kanban size={32} className={isDark ? 'text-dark-text-secondary' : 'text-slate-400'} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-dark-text' : 'text-slate-700'}`}>No boards yet</h3>
            <p className={`mb-6 ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>Create your first board to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map(board => (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className={`rounded-xl p-6 shadow-sm border cursor-pointer transition-all group ${
                  isDark 
                    ? 'bg-dark-card border-dark-border hover:border-primary-500' 
                    : 'bg-gray-200 border-gray-300 hover:shadow-md hover:border-primary-400'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: board.color || '#3b82f6' }}
                  >
                    <Kanban size={24} className="text-white" />
                  </div>
                </div>
                <h3 className={`text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors ${
                  isDark ? 'text-dark-text' : 'text-slate-800'
                }`}>
                  {board.title}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>
                  {board.description || 'No description'}
                </p>
                <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-dark-text-secondary' : 'text-slate-400'}`}>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {board.createdAt ? new Date(board.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {board.members?.length || 1} member(s)
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Board Card */}
            <div
              onClick={() => setShowCreateModal(true)}
              className={`rounded-xl p-6 border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] ${
                isDark 
                  ? 'bg-dark-card border-dark-border hover:border-primary-500' 
                  : 'bg-slate-50 border-slate-300 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isDark ? 'bg-dark-border' : 'bg-slate-200'
              }`}>
                <Plus size={24} className={isDark ? 'text-dark-text-secondary' : 'text-slate-500'} />
              </div>
              <p className={`font-medium ${isDark ? 'text-dark-text' : 'text-slate-600'}`}>Create New Board</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl w-full max-w-md p-6 animate-fade-in ${
            isDark ? 'bg-dark-card' : 'bg-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-dark-text' : 'text-slate-800'}`}>Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-text' : 'text-slate-700'}`}>
                  Board Title
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-dark-border border-dark-border text-dark-text placeholder-dark-text-secondary' 
                      : 'bg-gray-100 border-gray-300 text-gray-800'
                  }`}
                  placeholder="e.g., Product Development"
                  required
                />
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-text' : 'text-slate-700'}`}>
                  Description (optional)
                </label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                    isDark 
                      ? 'bg-dark-border border-dark-border text-dark-text placeholder-dark-text-secondary' 
                      : 'bg-gray-100 border-gray-300 text-gray-800'
                  }`}
                  placeholder="What is this board about?"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    isDark ? 'text-dark-text hover:bg-dark-border' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
