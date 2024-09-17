import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const adminAuthorization = (roles) => async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.user || !decoded.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const admin = await Admin.findById(decoded.user._id).exec();

    if (!admin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (roles && !roles.includes(decoded.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Error in adminAuthorization:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default adminAuthorization;
