const express = require('express')
const router = express.Router()

// In-memory store for chat messages
let channels = {
  general: { id: 'general', name: 'General', messages: [] },
  random: { id: 'random', name: 'Random', messages: [] },
  announcements: { id: 'announcements', name: 'Announcements', messages: [] }
}

// Get all channels
router.get('/channels', (req, res) => {
  const channelList = Object.values(channels).map(c => ({
    id: c.id,
    name: c.name,
    messageCount: c.messages.length
  }))
  res.json(channelList)
})

// Get channel by ID
router.get('/channels/:id', (req, res) => {
  const channel = channels[req.params.id]
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' })
  }
  res.json(channel)
})

// Create new channel
router.post('/channels', (req, res) => {
  const { name } = req.body
  const id = name.toLowerCase().replace(/\s+/g, '-')
  
  if (channels[id]) {
    return res.status(400).json({ error: 'Channel already exists' })
  }
  
  channels[id] = {
    id,
    name,
    messages: [],
    createdAt: new Date().toISOString()
  }
  
  const io = req.app.get('io')
  io.emit('channel-created', channels[id])
  
  res.status(201).json(channels[id])
})

// Get messages from a channel
router.get('/channels/:id/messages', (req, res) => {
  const channel = channels[req.params.id]
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' })
  }
  
  const limit = parseInt(req.query.limit) || 50
  const offset = parseInt(req.query.offset) || 0
  
  const messages = channel.messages.slice(-limit - offset, -offset || undefined)
  res.json(messages)
})

// Send message to a channel
router.post('/channels/:id/messages', (req, res) => {
  const channel = channels[req.params.id]
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' })
  }
  
  const { text, userId, userName } = req.body
  
  const message = {
    id: `msg_${Date.now()}`,
    text,
    userId,
    userName,
    channelId: req.params.id,
    createdAt: new Date().toISOString()
  }
  
  channel.messages.push(message)
  
  // Keep only last 1000 messages per channel
  if (channel.messages.length > 1000) {
    channel.messages = channel.messages.slice(-1000)
  }
  
  const io = req.app.get('io')
  io.to(`chat:${req.params.id}`).emit('new-message', message)
  
  res.status(201).json(message)
})

// Delete a message
router.delete('/channels/:channelId/messages/:messageId', (req, res) => {
  const channel = channels[req.params.channelId]
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' })
  }
  
  const messageIndex = channel.messages.findIndex(m => m.id === req.params.messageId)
  if (messageIndex === -1) {
    return res.status(404).json({ error: 'Message not found' })
  }
  
  channel.messages.splice(messageIndex, 1)
  
  const io = req.app.get('io')
  io.to(`chat:${req.params.channelId}`).emit('message-deleted', {
    channelId: req.params.channelId,
    messageId: req.params.messageId
  })
  
  res.status(204).send()
})

// Direct messages between users
let directMessages = {}

// Get DM conversation
router.get('/dm/:recipientId', (req, res) => {
  const { userId } = req.query
  const conversationId = [userId, req.params.recipientId].sort().join('_')
  
  const conversation = directMessages[conversationId] || { messages: [] }
  res.json(conversation.messages)
})

// Send direct message
router.post('/dm/:recipientId', (req, res) => {
  const { text, userId, userName } = req.body
  const conversationId = [userId, req.params.recipientId].sort().join('_')
  
  if (!directMessages[conversationId]) {
    directMessages[conversationId] = { messages: [] }
  }
  
  const message = {
    id: `dm_${Date.now()}`,
    text,
    userId,
    userName,
    recipientId: req.params.recipientId,
    createdAt: new Date().toISOString()
  }
  
  directMessages[conversationId].messages.push(message)
  
  const io = req.app.get('io')
  io.to(`dm:${conversationId}`).emit('direct-message', message)
  
  res.status(201).json(message)
})

module.exports = router
