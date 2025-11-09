// ========================================
// routes/comprobantes.js (FINAL SIN CORS)
// ========================================
const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔑 CORRECCIÓN: Importación desde el middleware de autenticación separado
const { verifyToken } = require('./auth.middleware'); 

// ------------------------------------
// 1. POST - Registrar un comprobante (Protegida)
// ------------------------------------
router.post('/', verifyToken, async (req, res) => {
    const { numero, monto, fecha } = req.body;

    if (!numero || !monto || !fecha) {
        return res.status(400).json({ mensaje: 'Faltan datos requeridos (numero, monto, fecha)' });
    }

    try {
        const [result] = await db.tienda.query(
            'INSERT INTO comprobantes (numero, monto, fecha) VALUES (?, ?, ?)',
            [numero, monto, fecha]
        );
        res.status(201).json({ 
            mensaje: 'Comprobante registrado exitosamente', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error al registrar comprobante:', error);
        res.status(500).json({ mensaje: 'Error en el servidor al registrar el comprobante' });
    }
});

// ------------------------------------
// 2. GET - Obtener todos los comprobantes (Protegida)
// ------------------------------------
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.tienda.query('SELECT * FROM comprobantes ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener comprobantes:', error);
        res.status(500).json({ mensaje: 'Error en el servidor al obtener comprobantes' });
    }
});

// ------------------------------------
// 3. GET - Obtener comprobante por ID (Protegida)
// ------------------------------------
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.tienda.query('SELECT * FROM comprobantes WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Comprobante no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener comprobante:', error);
        res.status(500).json({ mensaje: 'Error en el servidor al obtener comprobante' });
    }
});

module.exports = router;