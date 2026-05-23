const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado para este recurso' });
    }
    next();
  };
};
 
module.exports = roleMiddleware;
 