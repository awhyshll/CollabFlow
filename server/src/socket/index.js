const onlineUsers = new Map()
const boardRooms = new Map()
const chatRooms = new Map()

function initializeSocket(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId
    const userName = socket.handshake.auth.userName

    console.log(`User connected: ${userName} (${userId})`)

    // Add user to online users
    if (userId) {
      onlineUsers.set(socket.id, { id: userId, name: userName, socketId: socket.id })
      broadcastOnlineUsers(io)
    }

    // Join a board room
    socket.on('join-board', (boardId) => {
      socket.join(`board:${boardId}`)
      
      if (!boardRooms.has(boardId)) {
        boardRooms.set(boardId, new Set())
      }
      boardRooms.get(boardId).add(socket.id)
      
      console.log(`User ${userName} joined board: ${boardId}`)
      
      // Notify others in the board
      socket.to(`board:${boardId}`).emit('user-joined-board', {
        userId,
        userName,
        boardId
      })
    })

    // Leave a board room
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`)
      
      if (boardRooms.has(boardId)) {
        boardRooms.get(boardId).delete(socket.id)
      }
      
      console.log(`User ${userName} left board: ${boardId}`)
      
      socket.to(`board:${boardId}`).emit('user-left-board', {
        userId,
        userName,
        boardId
      })
    })

    // Task events
    socket.on('task-created', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-created', data)
    })

    socket.on('task-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-updated', data)
    })

    socket.on('task-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-deleted', data)
    })

    socket.on('task-moved', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-moved', data)
    })

    // Column events
    socket.on('column-created', (data) => {
      socket.to(`board:${data.boardId}`).emit('column-created', data)
    })

    socket.on('column-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('column-updated', data)
    })

    socket.on('column-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('column-deleted', data)
    })

    // Chat functionality
    socket.on('join-chat', (roomId) => {
      socket.join(`chat:${roomId}`)
      
      if (!chatRooms.has(roomId)) {
        chatRooms.set(roomId, new Set())
      }
      chatRooms.get(roomId).add(socket.id)
      
      console.log(`User ${userName} joined chat: ${roomId}`)
    })

    socket.on('leave-chat', (roomId) => {
      socket.leave(`chat:${roomId}`)
      
      if (chatRooms.has(roomId)) {
        chatRooms.get(roomId).delete(socket.id)
      }
    })

    socket.on('send-message', (data) => {
      const { channelId, ...messageData } = data
      
      // Broadcast to all users in the chat room (including sender for consistency)
      io.to(`chat:${channelId}`).emit('new-message', {
        ...messageData,
        channelId
      })
    })

    socket.on('typing-start', (data) => {
      socket.to(`chat:${data.channelId}`).emit('user-typing', {
        userId,
        userName,
        channelId: data.channelId
      })
    })

    socket.on('typing-stop', (data) => {
      socket.to(`chat:${data.channelId}`).emit('user-stopped-typing', {
        userId,
        channelId: data.channelId
      })
    })

    // Notification events
    socket.on('send-notification', (data) => {
      if (data.targetUserId) {
        // Find target user's socket
        for (const [socketId, user] of onlineUsers.entries()) {
          if (user.id === data.targetUserId) {
            io.to(socketId).emit('notification', data)
            break
          }
        }
      } else if (data.boardId) {
        // Send to all board members
        socket.to(`board:${data.boardId}`).emit('notification', data)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userName} (${userId})`)
      
      // Remove from online users
      onlineUsers.delete(socket.id)
      broadcastOnlineUsers(io)
      
      // Remove from board rooms
      for (const [boardId, users] of boardRooms.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id)
          io.to(`board:${boardId}`).emit('user-left-board', {
            userId,
            userName,
            boardId
          })
        }
      }
      
      // Remove from chat rooms
      for (const users of chatRooms.values()) {
        users.delete(socket.id)
      }
    })
  })
}

function broadcastOnlineUsers(io) {
  const users = Array.from(onlineUsers.values()).map(u => ({
    id: u.id,
    name: u.name
  }))
  io.emit('online-users', users)
}

module.exports = initializeSocket
