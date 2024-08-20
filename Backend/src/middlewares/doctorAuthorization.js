export const doctorAuthorization = (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access forbidden: Doctors only' });
    }
    next();
};
