import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'
import { useState } from 'react'
import { useBoard } from '../../contexts/BoardContext'
import { useTheme } from '../../contexts/ThemeContext'
import { MoreHorizontal, Plus, Trash2, Edit2 } from 'lucide-react'

function Column({ column, tasks, boardId }) {
  const { createTask, updateColumn, deleteColumn } = useBoard()
  const { isDark } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleUpdateTitle = async (e) => {
    e.preventDefault()
    if (!editTitle.trim()) return
    await updateColumn(boardId, column.id, { title: editTitle })
    setIsEditing(false)
  }

  const handleDeleteColumn = async () => {
    if (window.confirm('Are you sure you want to delete this column and all its tasks?')) {
      await deleteColumn(boardId, column.id)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    await createTask(boardId, column.id, {
      title: newTaskTitle,
      description: '',
      priority: 'medium',
      assignees: [],
      dueDate: null,
      labels: []
    })

    setNewTaskTitle('')
    setShowAddTask(false)
  }

  const columnColors = {
    'To Do': 'bg-slate-500',
    'In Progress': 'bg-blue-500',
    'Review': 'bg-yellow-500',
    'Done': 'bg-green-500'
  }

  return (
    <div className={`flex-shrink-0 w-72 rounded-lg flex flex-col max-h-full ${isDark ? 'bg-dark-card' : 'bg-slate-100'}`}>
      {/* Column Header */}
      <div className={`p-3 rounded-t-lg border-b flex-shrink-0 ${isDark ? 'bg-dark-bg border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${columnColors[column.title] || 'bg-primary-500'}`} />
            {isEditing ? (
              <form onSubmit={handleUpdateTitle} className="flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`px-2 py-1 border rounded focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-dark-card border-dark-border text-white' : 'border-slate-200'}`}
                  autoFocus
                  onBlur={handleUpdateTitle}
                />
              </form>
            ) : (
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{column.title}</h3>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-dark-border text-gray-400' : 'bg-slate-200 text-slate-600'}`}>
              {tasks.length}
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-dark-card' : 'hover:bg-slate-100'}`}
            >
              <MoreHorizontal size={18} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
            </button>
            
            {showMenu && (
              <div className={`absolute right-0 mt-1 w-36 rounded-lg shadow-lg border py-1 z-10 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
                <button
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'hover:bg-dark-border text-gray-300' : 'hover:bg-slate-50'}`}
                >
                  <Edit2 size={14} /> Rename
                </button>
                <button
                  onClick={handleDeleteColumn}
                  className={`w-full px-3 py-2 text-left text-sm text-red-500 flex items-center gap-2 ${isDark ? 'hover:bg-dark-border' : 'hover:bg-slate-50'}`}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[100px] flex-1 overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? (isDark ? 'bg-primary-900/30' : 'bg-primary-50') : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                boardId={boardId}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task */}
      <div className={`p-2 border-t rounded-b-lg flex-shrink-0 ${isDark ? 'border-dark-border bg-dark-bg' : 'border-gray-300 bg-gray-200'}`}>
        {showAddTask ? (
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 mb-2 ${isDark ? 'bg-dark-card border-dark-border text-white placeholder-gray-500' : 'border-slate-200'}`}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-dark-card' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${isDark ? 'text-gray-400 hover:text-primary-400 hover:bg-dark-card' : 'text-slate-500 hover:text-primary-600 hover:bg-slate-50'}`}
          >
            <Plus size={18} />
            Add Task
          </button>
        )}
      </div>
    </div>
  )
}

export default Column
