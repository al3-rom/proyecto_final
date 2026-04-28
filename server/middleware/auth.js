const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  try {
    const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET);
    req.usuario = decoded;
    req.user = decoded; 
    next();  
  } catch (err) {
    console.error("JWT Verify Error:", err.message);
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




