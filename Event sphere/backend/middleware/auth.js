// backend/middleware/auth.js

const jwt = require('jsonwebtoken'); // Import the JSON Web Token package

// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
  // Extract the Authorization header from the request
  const authHeader = req.headers.authorization;

  // If no token is provided, deny access
  if (!authHeader) return res.status(403).json({ error: 'Token required' });

  // Extract the token from the header (expected format: "Bearer <token>")
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user information to the request object for future use
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    // If token is invalid or expired, respond with unauthorized error
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = verifyToken; // Export the middleware function
