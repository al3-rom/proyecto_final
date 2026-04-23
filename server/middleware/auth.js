const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.usuario = decoded;
    req.user = decoded; // Estandarizado para que req.user funcione tambien
    next();  
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'You don\'t have permission' });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRol };
