import { useState } from 'react'
import { useBoard } from '../../contexts/BoardContext'
import { useTheme } from '../../contexts/ThemeContext'
import { X, Calendar, User, Tag, Clock, Flag } from 'lucide-react'

function TaskModal({ task, boardId, onClose }) {
  const { updateTask } = useBoard()
  const { isDark } = useTheme()
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    dueDate: task.dueDate || '',
    labels: task.labels || []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateTask(boardId, task.id, formData)
    onClose()
  }

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in ${isDark ? 'bg-dark-card' : 'bg-gray-200'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-dark-border' : 'border-slate-200'}`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Edit Task</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-border text-gray-400' : 'hover:bg-slate-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'}`}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${isDark ? 'bg-dark-bg border-dark-border text-white placeholder-gray-500' : 'border-slate-200'}`}
              placeholder="Add a more detailed description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Priority */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                <Flag size={16} className="inline mr-2" />
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'}`}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                <Calendar size={16} className="inline mr-2" />
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'}`}
              />
            </div>
          </div>

          {/* Task Info */}
          <div className={`rounded-lg p-4 mb-6 ${isDark ? 'bg-dark-bg' : 'bg-slate-50'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Task Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>Created by:</span>
                <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{task.createdBy || 'Unknown'}</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>Created:</span>
                <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  {task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-dark-border' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
