// ========================================
// routes/auth.middleware.js (NUEVO ARCHIVO)
// Aísla la función verifyToken para romper la dependencia circular.
// ========================================
const jwt = require('jsonwebtoken');

// 🔑 CLAVE SECRETA: Lee de entorno
const SECRET_KEY = process.env.JWT_SECRET || 'acer@23_secreto_respaldo_cambiar'; 

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ mensaje: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ mensaje: 'Acceso denegado. Formato de token inválido.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
        }
        req.user = user; 
        next(); 
    });
};

// Exportamos solo la función
module.exports = {
    verifyToken
};