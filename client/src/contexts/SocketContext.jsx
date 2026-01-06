import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        auth: {
          userId: user.uid,
          userName: user.displayName || user.email
        }
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const joinBoard = (boardId) => {
    if (socket) {
      socket.emit('join-board', boardId)
    }
  }

  const leaveBoard = (boardId) => {
    if (socket) {
      socket.emit('leave-board', boardId)
    }
  }

  const joinChat = (roomId) => {
    if (socket) {
      socket.emit('join-chat', roomId)
    }
  }

  const leaveChat = (roomId) => {
    if (socket) {
      socket.emit('leave-chat', roomId)
    }
  }

  const value = {
    socket,
    connected,
    joinBoard,
    leaveBoard,
    joinChat,
    leaveChat
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
