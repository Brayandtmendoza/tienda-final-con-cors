// ========================================
// routes/auth.js (FINAL SIN CORS)
// ========================================
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db'); 
// 🔑 Importar verifyToken desde el middleware separado
const { verifyToken } = require('./auth.middleware'); 

const SECRET_KEY = process.env.JWT_SECRET || 'acer@23_secreto_respaldo_cambiar'; 


// ------------------------------------
// 1. POST - Login
// ------------------------------------
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    try {
        const [rows] = await db.tienda.query(
            'SELECT * FROM usuarios WHERE usuario = ? AND password = MD5(?)',
            [usuario, password]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        }

        const user = rows[0];
        const token = jwt.sign({ id: user.id, usuario: user.usuario }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ token, mensaje: 'Login exitoso' });

    } catch (err) {
        console.error('Error durante el login:', err);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ------------------------------------
// 2. POST - Registro
// ------------------------------------
router.post('/register', async (req, res) => {
    res.status(501).json({ mensaje: "Registro no implementado." });
});

// ------------------------------------
// 3. GET - Ruta de ejemplo protegida
// ------------------------------------
router.get('/check-users', verifyToken, async (req, res) => {
    res.json({ mensaje: "Token válido", user: req.user });
});

// Exportamos el router y la función verifyToken 
module.exports = {
    router: router,
    verifyToken: verifyToken 
};