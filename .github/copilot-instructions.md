# CollabFlow - Remote Team Collaboration Board

## Project Overview
A Kanban-style project management board for remote teams to collaborate on tasks in real-time.

## Tech Stack
- **Frontend**: React 18 with Vite, React Beautiful DnD, TailwindCSS
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time**: WebSockets (Socket.io)

## Project Structure
```
CollabFlow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── socket/        # WebSocket handlers
│   └── package.json
└── package.json           # Root package.json
```

## Features
- Create and assign tasks to team members
- Drag-and-drop Kanban board
- Real-time board updates via WebSockets
- Team chat for discussions
- Productivity analytics dashboard
- User authentication with Firebase

## Development Commands
- `npm install` - Install all dependencies
- `npm run dev` - Start both client and server in development mode
- `npm run client` - Start only the client
- `npm run server` - Start only the server
