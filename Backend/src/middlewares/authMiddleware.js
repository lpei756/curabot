import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded.user;
    next();
  });
};

export function extractUserIdFromToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }
  try {
    const tokenWithoutPrefix = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(tokenWithoutPrefix, process.env.JWT_SECRET);
    return decoded.user._id;
  } catch (error) {
    throw new Error('Invalid token');
  }
}


