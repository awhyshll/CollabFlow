const express = require('express')
const router = express.Router()

// In-memory store (in production, use Firebase Admin SDK)
let boards = []

// Get all boards
router.get('/', (req, res) => {
  res.json(boards)
})

// Get board by ID
router.get('/:id', (req, res) => {
  const board = boards.find(b => b.id === req.params.id)
  if (!board) {
    return res.status(404).json({ error: 'Board not found' })
  }
  res.json(board)
})

// Create board
router.post('/', (req, res) => {
  const { title, description, color, ownerId } = req.body
  
  const newBoard = {
    id: `board_${Date.now()}`,
    title,
    description,
    color,
    ownerId,
    members: [ownerId],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  boards.push(newBoard)
  
  // Emit socket event
  const io = req.app.get('io')
  io.emit('board-created', newBoard)
  
  res.status(201).json(newBoard)
})

// Update board
router.put('/:id', (req, res) => {
  const boardIndex = boards.findIndex(b => b.id === req.params.id)
  if (boardIndex === -1) {
    return res.status(404).json({ error: 'Board not found' })
  }
  
  boards[boardIndex] = {
    ...boards[boardIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  const io = req.app.get('io')
  io.to(`board:${req.params.id}`).emit('board-updated', boards[boardIndex])
  
  res.json(boards[boardIndex])
})

// Delete board
router.delete('/:id', (req, res) => {
  const boardIndex = boards.findIndex(b => b.id === req.params.id)
  if (boardIndex === -1) {
    return res.status(404).json({ error: 'Board not found' })
  }
  
  boards.splice(boardIndex, 1)
  
  const io = req.app.get('io')
  io.emit('board-deleted', { id: req.params.id })
  
  res.status(204).send()
})

// Add member to board
router.post('/:id/members', (req, res) => {
  const { userId } = req.body
  const board = boards.find(b => b.id === req.params.id)
  
  if (!board) {
    return res.status(404).json({ error: 'Board not found' })
  }
  
  if (!board.members.includes(userId)) {
    board.members.push(userId)
    board.updatedAt = new Date().toISOString()
    
    const io = req.app.get('io')
    io.to(`board:${req.params.id}`).emit('member-added', { boardId: req.params.id, userId })
  }
  
  res.json(board)
})

// Remove member from board
router.delete('/:id/members/:userId', (req, res) => {
  const board = boards.find(b => b.id === req.params.id)
  
  if (!board) {
    return res.status(404).json({ error: 'Board not found' })
  }
  
  const memberIndex = board.members.indexOf(req.params.userId)
  if (memberIndex > -1) {
    board.members.splice(memberIndex, 1)
    board.updatedAt = new Date().toISOString()
    
    const io = req.app.get('io')
    io.to(`board:${req.params.id}`).emit('member-removed', { 
      boardId: req.params.id, 
      userId: req.params.userId 
    })
  }
  
  res.json(board)
})

module.exports = router
