const { verifyToken } = require('../services/firebase')

// Authentication middleware
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const token = authHeader.split('Bearer ')[1]
  
  try {
    const decodedToken = await verifyToken(token)
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name
    }
    
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Optional auth - doesn't fail if no token
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1]
    
    try {
      const decodedToken = await verifyToken(token)
      if (decodedToken) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name
        }
      }
    } catch (error) {
      // Ignore auth errors for optional auth
    }
  }
  
  next()
}

module.exports = { authMiddleware, optionalAuth }
