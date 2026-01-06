# CollabFlow - Remote Team Collaboration Board

A real-time Kanban-style project management board for remote teams to collaborate on tasks.

<img width="1925" height="1019" alt="image" src="https://github.com/user-attachments/assets/3603744a-ad90-4fc6-a1f7-ac45e9f04e73" />

## 🚀 Features

- **📋 Kanban Board**: Drag-and-drop task management with customizable columns
- **⚡ Real-time Updates**: Live synchronization using WebSockets
- **💬 Team Chat**: Built-in messaging with channels for team discussions
- **📊 Analytics Dashboard**: Track team productivity with charts and metrics
- **🔐 Authentication**: Secure user authentication with Firebase
- **🎨 Modern UI**: Beautiful, responsive design with TailwindCSS

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- @hello-pangea/dnd (drag-and-drop)
- TailwindCSS
- Chart.js for analytics
- Socket.io-client for real-time

### Backend
- Node.js with Express
- Socket.io for WebSockets
- Firebase Admin SDK

### Database & Auth
- Firebase Firestore
- Firebase Authentication

## 📁 Project Structure

```
CollabFlow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Board/     # Kanban board components
│   │   │   └── Layout/    # Layout components
│   │   ├── contexts/      # React contexts (Auth, Board, Socket)
│   │   ├── pages/         # Page components
│   │   ├── services/      # Firebase configuration
│   │   └── main.jsx       # App entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── socket/        # WebSocket handlers
│   │   └── index.js       # Server entry point
│   └── package.json
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- npm or yarn

### 1. Clone and Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Get your configuration:
   - Go to Project Settings > General > Your apps
   - Click "Add app" and select Web
   - Copy the configuration

### 3. Environment Variables

**Client** (`client/.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3001
```

**Server** (`server/.env`):
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Firestore Rules

In Firebase Console > Firestore > Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Boards collection
    match /boards/{boardId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid in resource.data.members;
      
      // Columns subcollection
      match /columns/{columnId} {
        allow read, write: if request.auth != null;
      }
      
      // Tasks subcollection
      match /tasks/{taskId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Chat collection
    match /chats/{channelId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run the Application

```bash
# Development mode (runs both client and server)
npm run dev

# Or run separately:
npm run client  # Frontend on http://localhost:5173
npm run server  # Backend on http://localhost:3001
```

## 📖 Usage

### Creating a Board
1. Sign up or log in
2. Click "New Board" on the dashboard
3. Enter board name and description
4. Start adding tasks!

### Managing Tasks
- **Create**: Click "Add Task" in any column
- **Edit**: Click on a task to open details
- **Move**: Drag and drop between columns
- **Delete**: Use the task menu (⋮)

### Team Chat
- Navigate to "Team Chat" in sidebar
- Join channels (#general, #random, etc.)
- Send messages in real-time

### Analytics
- View task statistics
- Track completion rates
- Monitor team productivity

## 🔧 API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Tasks
- `GET /api/tasks` - Get tasks (query by boardId, columnId)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/move` - Move task
- `DELETE /api/tasks/:id` - Delete task

### Chat
- `GET /api/chat/channels` - Get channels
- `GET /api/chat/channels/:id/messages` - Get messages
- `POST /api/chat/channels/:id/messages` - Send message

## 🌐 WebSocket Events

### Board Events
- `join-board` / `leave-board`
- `task-created` / `task-updated` / `task-deleted`
- `task-moved`

### Chat Events
- `join-chat` / `leave-chat`
- `send-message` / `new-message`
- `typing-start` / `typing-stop`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) for drag-and-drop
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Lucide Icons](https://lucide.dev/) for icons
- [Firebase](https://firebase.google.com/) for backend services
