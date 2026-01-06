const express = require('express')
const router = express.Router()

// In-memory store
let tasks = []

// Get all tasks
router.get('/', (req, res) => {
  const { boardId, columnId } = req.query
  let filteredTasks = tasks
  
  if (boardId) {
    filteredTasks = filteredTasks.filter(t => t.boardId === boardId)
  }
  if (columnId) {
    filteredTasks = filteredTasks.filter(t => t.columnId === columnId)
  }
  
  res.json(filteredTasks)
})

// Get task by ID
router.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id)
  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }
  res.json(task)
})

// Create task
router.post('/', (req, res) => {
  const { 
    title, 
    description, 
    boardId, 
    columnId, 
    priority, 
    assignees, 
    dueDate, 
    labels,
    createdBy 
  } = req.body
  
  // Calculate order
  const columnTasks = tasks.filter(t => t.columnId === columnId)
  const maxOrder = columnTasks.length > 0 
    ? Math.max(...columnTasks.map(t => t.order)) + 1 
    : 0
  
  const newTask = {
    id: `task_${Date.now()}`,
    title,
    description: description || '',
    boardId,
    columnId,
    priority: priority || 'medium',
    assignees: assignees || [],
    dueDate: dueDate || null,
    labels: labels || [],
    order: maxOrder,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  tasks.push(newTask)
  
  const io = req.app.get('io')
  io.to(`board:${boardId}`).emit('task-created', newTask)
  
  res.status(201).json(newTask)
})

// Update task
router.put('/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id)
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' })
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  tasks[taskIndex] = updatedTask
  
  const io = req.app.get('io')
  io.to(`board:${updatedTask.boardId}`).emit('task-updated', updatedTask)
  
  res.json(updatedTask)
})

// Move task
router.patch('/:id/move', (req, res) => {
  const { columnId, order } = req.body
  const taskIndex = tasks.findIndex(t => t.id === req.params.id)
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' })
  }
  
  const task = tasks[taskIndex]
  const sourceColumnId = task.columnId
  
  task.columnId = columnId
  task.order = order
  task.updatedAt = new Date().toISOString()
  
  // Reorder tasks in destination column
  const columnTasks = tasks.filter(t => t.columnId === columnId && t.id !== task.id)
  columnTasks.forEach(t => {
    if (t.order >= order) {
      t.order += 1
    }
  })
  
  const io = req.app.get('io')
  io.to(`board:${task.boardId}`).emit('task-moved', {
    taskId: task.id,
    sourceColumnId,
    destColumnId: columnId,
    newOrder: order
  })
  
  res.json(task)
})

// Delete task
router.delete('/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id)
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' })
  }
  
  const task = tasks[taskIndex]
  tasks.splice(taskIndex, 1)
  
  const io = req.app.get('io')
  io.to(`board:${task.boardId}`).emit('task-deleted', { taskId: req.params.id })
  
  res.status(204).send()
})

// Add comment to task
router.post('/:id/comments', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id)
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' })
  }
  
  const { text, userId, userName } = req.body
  const comment = {
    id: `comment_${Date.now()}`,
    text,
    userId,
    userName,
    createdAt: new Date().toISOString()
  }
  
  if (!tasks[taskIndex].comments) {
    tasks[taskIndex].comments = []
  }
  
  tasks[taskIndex].comments.push(comment)
  
  const io = req.app.get('io')
  io.to(`board:${tasks[taskIndex].boardId}`).emit('comment-added', {
    taskId: req.params.id,
    comment
  })
  
  res.status(201).json(comment)
})

module.exports = router
