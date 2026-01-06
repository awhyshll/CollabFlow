import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

const BoardContext = createContext()

export function useBoard() {
  return useContext(BoardContext)
}

export function BoardProvider({ children }) {
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { socket, joinBoard, leaveBoard } = useSocket()

  // Fetch user's boards
  useEffect(() => {
    if (!user) {
      setBoards([])
      return
    }

    // Simple query first - fetch all boards where user is a member
    const boardsQuery = query(
      collection(db, 'boards'),
      where('members', 'array-contains', user.uid)
    )

    const unsubscribe = onSnapshot(boardsQuery, (snapshot) => {
      const boardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by createdAt on client side to avoid needing a compound index
      boardsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })
      setBoards(boardsData)
    }, (error) => {
      console.error('Error fetching boards:', error)
    })

    return () => unsubscribe()
  }, [user])

  // Subscribe to board updates
  const subscribeToBoard = useCallback((boardId) => {
    if (!boardId) return

    setLoading(true)
    joinBoard(boardId)

    // Subscribe to columns
    const columnsQuery = query(
      collection(db, 'boards', boardId, 'columns'),
      orderBy('order', 'asc')
    )

    const unsubColumns = onSnapshot(columnsQuery, (snapshot) => {
      const columnsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setColumns(columnsData)
    })

    // Subscribe to tasks
    const tasksQuery = query(
      collection(db, 'boards', boardId, 'tasks'),
      orderBy('order', 'asc')
    )

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTasks(tasksData)
      setLoading(false)
    })

    return () => {
      leaveBoard(boardId)
      unsubColumns()
      unsubTasks()
    }
  }, [joinBoard, leaveBoard])

  // Create a new board
  const createBoard = async (boardData) => {
    const newBoard = {
      ...boardData,
      ownerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'boards'), newBoard)
    
    // Create default columns
    const defaultColumns = [
      { title: 'To Do', order: 0 },
      { title: 'In Progress', order: 1 },
      { title: 'Review', order: 2 },
      { title: 'Done', order: 3 }
    ]

    for (const column of defaultColumns) {
      await addDoc(collection(db, 'boards', docRef.id, 'columns'), {
        ...column,
        createdAt: serverTimestamp()
      })
    }

    return docRef.id
  }

  // Create a new task
  const createTask = async (boardId, columnId, taskData) => {
    const columnTasks = tasks.filter(t => t.columnId === columnId)
    const maxOrder = columnTasks.length > 0 
      ? Math.max(...columnTasks.map(t => t.order)) + 1 
      : 0

    const newTask = {
      ...taskData,
      columnId,
      order: maxOrder,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'boards', boardId, 'tasks'), newTask)
    
    // Emit socket event for real-time update
    if (socket) {
      socket.emit('task-created', { boardId, task: { id: docRef.id, ...newTask } })
    }

    return docRef.id
  }

  // Update a task
  const updateTask = async (boardId, taskId, updates) => {
    const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })

    if (socket) {
      socket.emit('task-updated', { boardId, taskId, updates })
    }
  }

  // Delete a task
  const deleteTask = async (boardId, taskId) => {
    const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
    await deleteDoc(taskRef)

    if (socket) {
      socket.emit('task-deleted', { boardId, taskId })
    }
  }

  // Move task between columns
  const moveTask = async (boardId, taskId, sourceColumnId, destColumnId, newOrder) => {
    const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
    await updateDoc(taskRef, {
      columnId: destColumnId,
      order: newOrder,
      updatedAt: serverTimestamp()
    })

    if (socket) {
      socket.emit('task-moved', { 
        boardId, 
        taskId, 
        sourceColumnId, 
        destColumnId, 
        newOrder 
      })
    }
  }

  // Create a new column
  const createColumn = async (boardId, title) => {
    const maxOrder = columns.length > 0 
      ? Math.max(...columns.map(c => c.order)) + 1 
      : 0

    const newColumn = {
      title,
      order: maxOrder,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'boards', boardId, 'columns'), newColumn)
  }

  // Update a column
  const updateColumn = async (boardId, columnId, updates) => {
    const columnRef = doc(db, 'boards', boardId, 'columns', columnId)
    await updateDoc(columnRef, updates)
  }

  // Delete a column
  const deleteColumn = async (boardId, columnId) => {
    const columnRef = doc(db, 'boards', boardId, 'columns', columnId)
    await deleteDoc(columnRef)

    // Delete all tasks in the column
    const columnTasks = tasks.filter(t => t.columnId === columnId)
    for (const task of columnTasks) {
      await deleteTask(boardId, task.id)
    }
  }

  const value = {
    boards,
    currentBoard,
    setCurrentBoard,
    columns,
    tasks,
    loading,
    subscribeToBoard,
    createBoard,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createColumn,
    updateColumn,
    deleteColumn
  }

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  )
}
