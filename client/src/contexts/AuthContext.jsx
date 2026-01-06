import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Register a new ADMIN
  async function registerAdmin(email, password, organizationName, adminAccessCode) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: organizationName })
    
    // Create admin profile in Firestore 'admins' collection
    const adminDoc = {
      uid: user.uid,
      email: user.email,
      organizationName,
      adminAccessCode,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: 'admin'
    }
    
    await setDoc(doc(db, 'admins', user.uid), adminDoc)
    setUserProfile(adminDoc)
    
    return user
  }

  // Register a new MEMBER
  async function registerMember(email, password, fullName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: fullName })
    
    // Create member profile in Firestore 'members' collection
    const memberDoc = {
      uid: user.uid,
      email: user.email,
      fullName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: 'member',
      teamCode: ''
    }
    
    await setDoc(doc(db, 'members', user.uid), memberDoc)
    setUserProfile(memberDoc)
    
    return user
  }

  // Login as ADMIN - verifies against admins collection
  async function loginAdmin(email, password, organizationName, adminAccessCode) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    
    // Fetch admin profile from Firestore
    const adminDocRef = doc(db, 'admins', user.uid)
    const adminDoc = await getDoc(adminDocRef)
    
    if (!adminDoc.exists()) {
      await signOut(auth)
      throw new Error('No admin account found. Please register as admin first.')
    }
    
    const adminData = adminDoc.data()
    
    // Verify organization name and admin access code
    if (adminData.organizationName !== organizationName) {
      await signOut(auth)
      throw new Error('Organization name does not match.')
    }
    
    if (adminData.adminAccessCode !== adminAccessCode) {
      await signOut(auth)
      throw new Error('Invalid admin access code.')
    }
    
    // Update last login
    await updateDoc(adminDocRef, {
      lastLogin: new Date().toISOString()
    })
    
    setUserProfile({ ...adminData, lastLogin: new Date().toISOString() })
    return user
  }

  // Login as MEMBER - verifies against members collection
  async function loginMember(email, password, teamCode) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    
    // Fetch member profile from Firestore
    const memberDocRef = doc(db, 'members', user.uid)
    const memberDoc = await getDoc(memberDocRef)
    
    if (!memberDoc.exists()) {
      await signOut(auth)
      throw new Error('No member account found. Please register as member first.')
    }
    
    const memberData = memberDoc.data()
    
    // Update team code and last login
    await updateDoc(memberDocRef, {
      teamCode,
      lastLogin: new Date().toISOString()
    })
    
    setUserProfile({ ...memberData, teamCode, lastLogin: new Date().toISOString() })
    return user
  }

  async function logout() {
    setUserProfile(null)
    localStorage.removeItem('userRole')
    localStorage.removeItem('organizationName')
    localStorage.removeItem('teamCode')
    return signOut(auth)
  }

  async function fetchUserProfile(uid) {
    // Try to find in admins first
    const adminDocRef = doc(db, 'admins', uid)
    const adminDoc = await getDoc(adminDocRef)
    
    if (adminDoc.exists()) {
      const data = adminDoc.data()
      setUserProfile(data)
      localStorage.setItem('userRole', 'admin')
      return data
    }
    
    // Try members collection
    const memberDocRef = doc(db, 'members', uid)
    const memberDoc = await getDoc(memberDocRef)
    
    if (memberDoc.exists()) {
      const data = memberDoc.data()
      setUserProfile(data)
      localStorage.setItem('userRole', 'member')
      return data
    }
    
    return null
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    registerAdmin,
    registerMember,
    loginAdmin,
    loginMember,
    logout,
    fetchUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
