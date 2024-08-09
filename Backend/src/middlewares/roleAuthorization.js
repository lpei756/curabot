// middlewares/roleAuthorization.js
export const roleAuthorization = (allowedRoles) => (req, res, next) => {
    try {
      const userRole = req.user.role; // Assume req.user is populated by authentication middleware
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      next();
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };