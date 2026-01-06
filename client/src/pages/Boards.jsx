import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoard } from '../contexts/BoardContext'
import { useTheme } from '../contexts/ThemeContext'
import { Plus, Kanban, Users, Calendar, Search, Grid, List, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

function Boards() {
  const { boards, createBoard } = useBoard()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

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

  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-slate-800'}`}>All Boards</h1>
          <p className={`mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>
            Manage and access all your project boards
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Create Board
        </button>
      </div>

      {/* Search and View Controls */}
      <div className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search boards..."
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'bg-white border-slate-200'
            }`}
          />
        </div>

        {/* View Toggle */}
        <div className={`flex items-center rounded-lg p-1 ${isDark ? 'bg-dark-bg' : 'bg-slate-100'}`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-primary-600 text-white' 
                : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-primary-600 text-white' 
                : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Boards Count */}
      <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>
        {filteredBoards.length} board{filteredBoards.length !== 1 ? 's' : ''} found
      </p>

      {/* Boards Grid/List */}
      {filteredBoards.length === 0 ? (
        <div className={`rounded-xl p-12 text-center border transition-colors ${
          isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-dark-border' : 'bg-slate-100'
          }`}>
            <Kanban size={32} className={isDark ? 'text-dark-text-secondary' : 'text-slate-400'} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-dark-text' : 'text-slate-700'}`}>
            {searchQuery ? 'No boards found' : 'No boards yet'}
          </h3>
          <p className={`mb-6 ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>
            {searchQuery ? 'Try a different search term' : 'Create your first board to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Board
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoards.map(board => (
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
                  {board.members?.length || 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBoards.map(board => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className={`rounded-xl p-4 border cursor-pointer transition-all flex items-center gap-4 group ${
                isDark 
                  ? 'bg-dark-card border-dark-border hover:border-primary-500' 
                  : 'bg-gray-200 border-gray-300 hover:shadow-md hover:border-primary-400'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: board.color || '#3b82f6' }}
              >
                <Kanban size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold group-hover:text-primary-600 transition-colors truncate ${
                  isDark ? 'text-dark-text' : 'text-slate-800'
                }`}>
                  {board.title}
                </h3>
                <p className={`text-sm truncate ${isDark ? 'text-dark-text-secondary' : 'text-slate-500'}`}>
                  {board.description || 'No description'}
                </p>
              </div>
              <div className={`flex items-center gap-6 text-sm ${isDark ? 'text-dark-text-secondary' : 'text-slate-400'}`}>
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
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-md ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-dark-text' : 'text-slate-800'}`}>
              Create New Board
            </h2>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Board Title
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'
                  }`}
                  placeholder="Enter board title"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Description (optional)
                </label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                    isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'
                  }`}
                  placeholder="Enter board description"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                    isDark ? 'bg-dark-border text-gray-300 hover:bg-dark-bg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
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

export default Boards
