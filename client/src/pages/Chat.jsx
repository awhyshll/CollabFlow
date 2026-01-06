import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useTheme } from '../contexts/ThemeContext'
import { Send, Hash, Users, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'

function Chat() {
  const { user, userProfile } = useAuth()
  const { socket, joinChat, leaveChat } = useSocket()
  const { isDark } = useTheme()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [channels, setChannels] = useState([
    { id: 'general', name: 'General', type: 'channel' },
    { id: 'random', name: 'Random', type: 'channel' },
    { id: 'announcements', name: 'Announcements', type: 'channel' }
  ])
  const [activeChannel, setActiveChannel] = useState('general')
  const [onlineUsers, setOnlineUsers] = useState([])
  const messagesEndRef = useRef(null)

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Subscribe to messages
  useEffect(() => {
    if (!activeChannel) return

    joinChat(activeChannel)

    const messagesQuery = query(
      collection(db, 'chats', activeChannel, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse()
      setMessages(messagesData)
    })

    return () => {
      leaveChat(activeChannel)
      unsubscribe()
    }
  }, [activeChannel, joinChat, leaveChat])

  // Listen for real-time messages via socket
  useEffect(() => {
    if (!socket) return

    socket.on('new-message', (message) => {
      if (message.channelId === activeChannel) {
        setMessages(prev => [...prev, message])
      }
    })

    socket.on('online-users', (users) => {
      setOnlineUsers(users)
    })

    return () => {
      socket.off('new-message')
      socket.off('online-users')
    }
  }, [socket, activeChannel])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageData = {
      text: newMessage,
      userId: user.uid,
      userName: userProfile?.displayName || user.email,
      createdAt: serverTimestamp()
    }

    try {
      await addDoc(collection(db, 'chats', activeChannel, 'messages'), messageData)
      
      // Emit socket event for real-time
      if (socket) {
        socket.emit('send-message', {
          ...messageData,
          channelId: activeChannel,
          createdAt: new Date().toISOString()
        })
      }

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className={`h-[calc(100vh-140px)] rounded-xl shadow-sm border flex overflow-hidden ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
      {/* Sidebar */}
      <div className={`w-64 flex flex-col ${isDark ? 'bg-dark-bg' : 'bg-slate-900'} text-white`}>
        {/* Team Header */}
        <div className={`p-4 border-b ${isDark ? 'border-dark-border' : 'border-slate-700'}`}>
          <h2 className="font-bold text-lg">CollabFlow Team</h2>
          <p className="text-sm text-slate-400">Team workspace</p>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Channels
              </span>
              <button className={`p-1 rounded ${isDark ? 'hover:bg-dark-card' : 'hover:bg-slate-700'}`}>
                <Plus size={14} />
              </button>
            </div>
            <ul className="space-y-1">
              {channels.map(channel => (
                <li key={channel.id}>
                  <button
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      activeChannel === channel.id
                        ? 'bg-primary-600 text-white'
                        : `text-slate-300 ${isDark ? 'hover:bg-dark-card' : 'hover:bg-slate-800'}`
                    }`}
                  >
                    <Hash size={16} />
                    {channel.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Online Users */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Online — {onlineUsers.length || 1}
              </span>
            </div>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 px-3 py-2 text-slate-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {userProfile?.displayName || user?.email} (you)
              </li>
              {onlineUsers
                .filter(u => u.id !== user?.uid)
                .map(u => (
                  <li key={u.id} className="flex items-center gap-2 px-3 py-2 text-slate-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {u.name}
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-dark-border' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <Hash size={20} className={isDark ? 'text-gray-500' : 'text-slate-400'} />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {channels.find(c => c.id === activeChannel)?.name || activeChannel}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-border' : 'hover:bg-slate-100'}`}>
              <Users size={18} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-border' : 'hover:bg-slate-100'}`}>
              <Search size={18} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-messages">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-dark-border' : 'bg-slate-100'}`}>
                <Hash size={32} className={isDark ? 'text-gray-500' : 'text-slate-400'} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>Welcome to #{activeChannel}</h3>
              <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>This is the start of the channel. Say hello! 👋</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId
              
              return (
                <div key={message.id} className={`flex gap-3 ${!showAvatar ? 'pl-12' : ''}`}>
                  {showAvatar && (
                    <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {message.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{message.userName}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                          {message.createdAt?.seconds 
                            ? format(new Date(message.createdAt.seconds * 1000), 'h:mm a')
                            : 'Just now'
                          }
                        </span>
                      </div>
                    )}
                    <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>{message.text}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className={`p-4 border-t ${isDark ? 'border-dark-border' : 'border-slate-200'}`}>
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${activeChannel}`}
              className={`flex-1 px-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all ${isDark ? 'bg-dark-bg text-gray-300 placeholder-gray-500 focus:bg-dark-border' : 'bg-gray-300 focus:bg-gray-100'}`}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
