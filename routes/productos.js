// ========================================
// routes/productos.js (FINAL SIN CORS)
// ========================================
const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔑 CORRECCIÓN: Importación desde el middleware de autenticación separado
const { verifyToken } = require('./auth.middleware'); 

// ------------------------------------
// 1. GET - Obtener todos los productos
// ------------------------------------
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.tienda.query(`
            SELECT 
                p.id, 
                p.nombre, 
                p.precio, 
                c.nombre AS categoria,
                ip.url AS imagenes_productos_url
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN imagenes_productos ip ON p.id = ip.producto_id
            GROUP BY p.id
            ORDER BY p.id ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
});

// ------------------------------------
// 2. GET - Obtener un producto por ID
// ------------------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.tienda.query('SELECT * FROM productos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error al obtener producto:', err);
        res.status(500).json({ mensaje: 'Error al obtener producto' });
    }
});

// ------------------------------------
// 3. POST - Crear un nuevo producto (Protegida con verifyToken)
// ------------------------------------
router.post('/', verifyToken, async (req, res) => {
    const { nombre, precio, categoria_id } = req.body;

    if (!nombre || !precio || !categoria_id) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios (nombre, precio, categoria_id)' });
    }

    try {
        const [result] = await db.tienda.query(
            'INSERT INTO productos (nombre, precio, categoria_id) VALUES (?, ?, ?)',
            [nombre.trim(), precio, categoria_id]
        );
        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            id: result.insertId,
            nombre,
            precio,
            categoria_id
        });
    } catch (err) {
        console.error('Error al crear producto:', err);
        res.status(500).json({ mensaje: 'Error al crear producto' });
    }
});

// ------------------------------------
// 4. PUT - Actualizar un producto (Protegida con verifyToken)
// ------------------------------------
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, categoria_id } = req.body;

    if (!nombre || !precio || !categoria_id) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios para actualizar el producto' });
    }

    try {
        const [result] = await db.tienda.query(
            'UPDATE productos SET nombre = ?, precio = ?, categoria_id = ? WHERE id = ?',
            [nombre.trim(), precio, categoria_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto actualizado con éxito', id, nombre, precio, categoria_id });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ mensaje: 'Error al actualizar producto' });
    }
});

// ------------------------------------
// 5. DELETE - Eliminar un producto (Protegida con verifyToken)
// ------------------------------------
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.tienda.query('DELETE FROM productos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado con éxito', id });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ mensaje: 'Error al eliminar producto' });
    }
});

module.exports = router;