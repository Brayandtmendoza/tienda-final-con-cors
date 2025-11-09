// ========================================
// routes/imagenes.js (FINAL SIN CORS)
// ========================================
const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔑 CORRECCIÓN: Importación desde el middleware de autenticación separado
const { verifyToken } = require('./auth.middleware'); 

// ------------------------------------
// 1. GET - Obtener todas las imágenes de un producto
// ------------------------------------
router.get('/:producto_id', async (req, res) => {
    const { producto_id } = req.params;
    try {
        const [rows] = await db.tienda.query(
            'SELECT url FROM imagenes_productos WHERE producto_id = ?',
            [producto_id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener imágenes:', err);
        res.status(500).json({ mensaje: 'Error interno al obtener las imágenes.' });
    }
});

// ------------------------------------
// 2. POST - Agregar imagen (JWT requerido)
// ------------------------------------
router.post('/', verifyToken, async (req, res) => {
    const { url, producto_id } = req.body;

    if (!url || !producto_id) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios (url, producto_id).' });
    }

    try {
        const [result] = await db.tienda.query(
            'INSERT INTO imagenes_productos (url, producto_id) VALUES (?, ?)',
            [url, producto_id]
        );
        res.status(201).json({ id: result.insertId, url, producto_id, mensaje: 'Imagen agregada con éxito.' });
    } catch (err) {
        console.error('Error al agregar imagen:', err);
        res.status(500).json({ mensaje: 'Error interno al agregar la imagen.' });
    }
});

module.exports = router;