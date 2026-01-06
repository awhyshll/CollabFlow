import { useMemo } from 'react'
import { useBoard } from '../contexts/BoardContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement 
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { TrendingUp, CheckCircle, Clock, AlertCircle, Calendar, Users } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

function Analytics() {
  const { boards, tasks, columns } = useBoard()
  const { isDark } = useTheme()

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => {
      const column = columns.find(c => c.id === t.columnId)
      return column?.title?.toLowerCase().includes('done')
    }).length
    const inProgressTasks = tasks.filter(t => {
      const column = columns.find(c => c.id === t.columnId)
      return column?.title?.toLowerCase().includes('progress')
    }).length
    const todoTasks = tasks.filter(t => {
      const column = columns.find(c => c.id === t.columnId)
      return column?.title?.toLowerCase().includes('to do') || column?.title?.toLowerCase().includes('todo')
    }).length
    
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false
      const dueDate = typeof t.dueDate === 'object' ? new Date(t.dueDate.seconds * 1000) : new Date(t.dueDate)
      return dueDate < new Date() && !columns.find(c => c.id === t.columnId)?.title?.toLowerCase().includes('done')
    }).length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      highPriorityTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  }, [tasks, columns])

  // Tasks by status chart data
  const tasksByStatusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [
      {
        data: [stats.todoTasks, stats.inProgressTasks, tasks.filter(t => {
          const column = columns.find(c => c.id === t.columnId)
          return column?.title?.toLowerCase().includes('review')
        }).length, stats.completedTasks],
        backgroundColor: [
          'rgba(100, 116, 139, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(100, 116, 139)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 1
      }
    ]
  }

  // Tasks by priority chart data
  const tasksByPriorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          tasks.filter(t => t.priority === 'low').length,
          tasks.filter(t => t.priority === 'medium').length,
          tasks.filter(t => t.priority === 'high').length
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }
    ]
  }

  // Weekly activity data (mock)
  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [3, 5, 2, 8, 4, 1, 2],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Tasks Created',
        data: [4, 6, 3, 7, 5, 2, 3],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: Clock,
      color: 'bg-blue-500',
      bgColor: isDark ? 'bg-blue-900/30' : 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: isDark ? 'bg-green-900/30' : 'bg-green-50'
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      bgColor: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: isDark ? 'bg-red-900/30' : 'bg-red-50'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Analytics Dashboard</h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Track your team's productivity and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 border ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>This week</span>
            </div>
            <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</h3>
            <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Completion Rate</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-dark-border' : 'bg-slate-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stats.completionRate}%</span>
        </div>
        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          {stats.completedTasks} of {stats.totalTasks} tasks completed
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Tasks by Status</h3>
          <div className="h-64">
            <Doughnut data={tasksByStatusData} options={chartOptions} />
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Tasks by Priority</h3>
          <div className="h-64">
            <Bar data={tasksByPriorityData} options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    color: isDark ? '#9ca3af' : undefined
                  },
                  grid: {
                    color: isDark ? '#222222' : undefined
                  }
                },
                x: {
                  ticks: {
                    color: isDark ? '#9ca3af' : undefined
                  },
                  grid: {
                    color: isDark ? '#222222' : undefined
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Weekly Activity</h3>
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            <Calendar size={16} />
            {format(startOfWeek(new Date()), 'MMM d')} - {format(endOfWeek(new Date()), 'MMM d, yyyy')}
          </div>
        </div>
        <div className="h-80">
          <Line data={weeklyActivityData} options={{
            ...chartOptions,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  color: isDark ? '#9ca3af' : undefined
                },
                grid: {
                  color: isDark ? '#222222' : undefined
                }
              },
              x: {
                ticks: {
                  color: isDark ? '#9ca3af' : undefined
                },
                grid: {
                  color: isDark ? '#222222' : undefined
                }
              }
            }
          }} />
        </div>
      </div>

      {/* Board Summary */}
      <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
        <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Board Summary</h3>
        {boards.length === 0 ? (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>No boards created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left text-sm border-b ${isDark ? 'text-gray-400 border-dark-border' : 'text-slate-500 border-slate-100'}`}>
                  <th className="pb-3 font-medium">Board</th>
                  <th className="pb-3 font-medium">Members</th>
                  <th className="pb-3 font-medium">Tasks</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {boards.map(board => (
                  <tr key={board.id} className={`border-b ${isDark ? 'border-dark-border hover:bg-dark-border' : 'border-slate-50 hover:bg-slate-50'}`}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: board.color || '#3b82f6' }}
                        >
                          {board.title?.[0]?.toUpperCase()}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{board.title}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <Users size={16} className={isDark ? 'text-gray-500' : 'text-slate-400'} />
                        <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>{board.members?.length || 1}</span>
                      </div>
                    </td>
                    <td className={`py-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                      {tasks.filter(t => t.boardId === board.id).length || '—'}
                    </td>
                    <td className={`py-4 text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                      {board.createdAt 
                        ? format(new Date(board.createdAt.seconds * 1000), 'MMM d, yyyy')
                        : 'Recently'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
