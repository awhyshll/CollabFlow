const express = require('express')
const router = express.Router()

// In-memory store
let users = []

// Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})

// Create or update user profile
router.post('/', (req, res) => {
  const { uid, email, displayName, photoURL } = req.body
  
  const existingIndex = users.findIndex(u => u.id === uid)
  
  if (existingIndex > -1) {
    users[existingIndex] = {
      ...users[existingIndex],
      email,
      displayName,
      photoURL,
      updatedAt: new Date().toISOString()
    }
    return res.json(users[existingIndex])
  }
  
  const newUser = {
    id: uid,
    email,
    displayName,
    photoURL,
    teams: [],
    role: 'member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  users.push(newUser)
  res.status(201).json(newUser)
})

// Update user profile
router.put('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id)
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  res.json(users[userIndex])
})

// Search users by email
router.get('/search/:email', (req, res) => {
  const user = users.find(u => 
    u.email.toLowerCase().includes(req.params.email.toLowerCase())
  )
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  // Return limited info for search
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  })
})

// Get user's boards
router.get('/:id/boards', (req, res) => {
  // This would typically query the boards collection
  // For now, return empty array as boards are managed via boardRoutes
  res.json([])
})

// Update user's notification settings
router.patch('/:id/notifications', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id)
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  users[userIndex].notifications = req.body
  users[userIndex].updatedAt = new Date().toISOString()
  
  res.json(users[userIndex])
})

module.exports = router
