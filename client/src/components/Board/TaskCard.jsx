import { Draggable } from '@hello-pangea/dnd'
import { useState } from 'react'
import { useBoard } from '../../contexts/BoardContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Calendar, User, Tag, MoreHorizontal, Edit2, Trash2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import TaskModal from './TaskModal'

function TaskCard({ task, index, boardId }) {
  const { deleteTask } = useBoard()
  const { isDark } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const priorityColors = {
    low: isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700',
    medium: isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    high: isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(boardId, task.id)
    }
  }

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`task-card rounded-lg p-3 mb-2 border cursor-pointer ${
              isDark 
                ? `bg-dark-bg border-dark-border ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : 'shadow-sm'}`
                : `bg-gray-200 border-gray-300 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : 'shadow-sm'}`
            }`}
            onClick={() => setShowModal(true)}
          >
            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {task.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 text-xs rounded-full"
                    style={{ backgroundColor: label.color + '20', color: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h4 className={`font-medium text-sm mb-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</h4>

            {/* Description Preview */}
            {task.description && (
              <p className={`text-xs mb-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{task.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Priority */}
                <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[task.priority] || priorityColors.medium}`}>
                  {task.priority}
                </span>

                {/* Due Date */}
                {task.dueDate && (
                  <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    <Calendar size={12} />
                    {format(new Date(task.dueDate), 'MMM d')}
                  </div>
                )}
              </div>

              {/* Assignees & Menu */}
              <div className="flex items-center gap-2">
                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex -space-x-2">
                    {task.assignees.slice(0, 3).map((assignee, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded-full bg-primary-500 border-2 flex items-center justify-center text-white text-xs ${isDark ? 'border-dark-bg' : 'border-white'}`}
                        title={assignee.name}
                      >
                        {assignee.name?.[0]?.toUpperCase() || <User size={12} />}
                      </div>
                    ))}
                    {task.assignees.length > 3 && (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${isDark ? 'bg-dark-border border-dark-bg text-gray-400' : 'bg-slate-200 border-white text-slate-600'}`}>
                        +{task.assignees.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-dark-card' : 'hover:bg-slate-100'}`}
                  >
                    <MoreHorizontal size={16} className={isDark ? 'text-gray-500' : 'text-slate-400'} />
                  </button>
                  
                  {showMenu && (
                    <div className={`absolute right-0 mt-1 w-32 rounded-lg shadow-lg border py-1 z-10 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
                      <button
                        onClick={() => { setShowModal(true); setShowMenu(false); }}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'hover:bg-dark-border text-gray-300' : 'hover:bg-slate-50'}`}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className={`w-full px-3 py-2 text-left text-sm text-red-500 flex items-center gap-2 ${isDark ? 'hover:bg-dark-border' : 'hover:bg-slate-50'}`}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {showModal && (
        <TaskModal
          task={task}
          boardId={boardId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default TaskCard
