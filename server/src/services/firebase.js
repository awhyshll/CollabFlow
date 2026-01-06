const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// and save it as serviceAccountKey.json in the server folder

let db = null

function initializeFirebase() {
  try {
    // Option 1: Using service account file
    // const serviceAccount = require('../../serviceAccountKey.json')
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount)
    // })

    // Option 2: Using environment variables
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      })
      db = admin.firestore()
      console.log('Firebase Admin SDK initialized')
    } else {
      console.log('Firebase Admin SDK not configured - using in-memory storage')
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error)
  }
}

// Verify Firebase ID token
async function verifyToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Get user by UID
async function getUser(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid)
    return userRecord
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

module.exports = {
  initializeFirebase,
  verifyToken,
  getUser,
  admin,
  getDb: () => db
}
