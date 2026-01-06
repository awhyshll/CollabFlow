import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYgFYkHwfH7Zhd-IbpbTKTJq1kXxJisY4",
  authDomain: "collabflow-91f74.firebaseapp.com",
  projectId: "collabflow-91f74",
  storageBucket: "collabflow-91f74.firebasestorage.app",
  messagingSenderId: "572148726774",
  appId: "1:572148726774:web:a42308632df9cc7aa4a5d7",
  measurementId: "G-J3EHGY6CY8"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
