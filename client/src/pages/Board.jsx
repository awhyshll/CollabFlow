import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useBoard } from '../contexts/BoardContext'
import { useTheme } from '../contexts/ThemeContext'
import KanbanBoard from '../components/Board/KanbanBoard'
import { ArrowLeft, Users, Settings, Share2 } from 'lucide-react'

function Board() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const { subscribeToBoard, currentBoard, setCurrentBoard, loading } = useBoard()
  const { isDark } = useTheme()
  const [boardData, setBoardData] = useState(null)

  useEffect(() => {
    if (!boardId) return

    // Fetch board data
    const fetchBoard = async () => {
      const boardDoc = await getDoc(doc(db, 'boards', boardId))
      if (boardDoc.exists()) {
        setBoardData({ id: boardDoc.id, ...boardDoc.data() })
        setCurrentBoard({ id: boardDoc.id, ...boardDoc.data() })
      } else {
        navigate('/dashboard')
      }
    }

    fetchBoard()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToBoard(boardId)
    
    return () => {
      if (unsubscribe) unsubscribe()
      setCurrentBoard(null)
    }
  }, [boardId, subscribeToBoard, setCurrentBoard, navigate])

  if (loading || !boardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-primary-400' : 'border-primary-600'}`}></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-card text-gray-400' : 'hover:bg-slate-200 text-slate-600'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{boardData.title}</h1>
            {boardData.description && (
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{boardData.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-dark-card' : 'text-slate-600 hover:bg-slate-200'}`}>
            <Users size={18} />
            <span className="hidden sm:inline">Members</span>
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-dark-card' : 'text-slate-600 hover:bg-slate-200'}`}>
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-dark-card' : 'text-slate-600 hover:bg-slate-200'}`}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden min-h-0">
        <KanbanBoard boardId={boardId} />
      </div>
    </div>
  )
}

export default Board
