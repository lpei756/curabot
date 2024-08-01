import jwt from 'jsonwebtoken';
import { AUTH_PATHS, buildPathWithBase } from '../routes/path.js';

export const authenticate = (req, res, next) => {
  const authPathBase = buildPathWithBase(AUTH_PATHS); // Build the auth path base
  const excludedPaths = [authPathBase.login, authPathBase.register]; // Paths to exclude from authentication
  
  if (excludedPaths.includes(req.path)) {
    return next(); // Skip middleware for paths in the excludedPaths array
  }

  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
