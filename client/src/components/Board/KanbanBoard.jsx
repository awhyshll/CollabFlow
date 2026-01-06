import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import Column from './Column'
import { useBoard } from '../../contexts/BoardContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Plus } from 'lucide-react'
import { useState } from 'react'

function KanbanBoard({ boardId }) {
  const { columns, tasks, moveTask, createColumn } = useBoard()
  const { isDark } = useTheme()
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    await moveTask(
      boardId,
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    )
  }

  const handleAddColumn = async (e) => {
    e.preventDefault()
    if (!newColumnTitle.trim()) return

    await createColumn(boardId, newColumnTitle)
    setNewColumnTitle('')
    setShowAddColumn(false)
  }

  const getColumnTasks = (columnId) => {
    return tasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.order - b.order)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto h-full pb-2">
        {columns.map(column => (
          <Column
            key={column.id}
            column={column}
            tasks={getColumnTasks(column.id)}
            boardId={boardId}
          />
        ))}
        
        {/* Add Column Button */}
        <div className="flex-shrink-0 w-72">
          {showAddColumn ? (
            <form onSubmit={handleAddColumn} className={`rounded-lg p-3 shadow-sm ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Column title..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2 text-sm ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200'}`}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddColumn(false)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isDark ? 'text-gray-400 hover:bg-dark-border' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className={`w-full py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${isDark ? 'border-dark-border text-gray-500 hover:border-primary-400 hover:text-primary-400' : 'border-slate-300 text-slate-500 hover:border-primary-400 hover:text-primary-600'}`}
            >
              <Plus size={18} />
              Add Column
            </button>
          )}
        </div>
      </div>
    </DragDropContext>
  )
}

export default KanbanBoard
