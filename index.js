// ========================================
// index.js (MÍNIMO Y DE PURACIÓN)
// ========================================
require('dotenv').config({ path: './railway.env' }); 

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// 🚨 Cargar solo la DB
const db = require('./db'); 

const app = express();
const PORT = process.env.PORT || 3000; 

// ------------------------------------
// Middlewares y Root
// ------------------------------------
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'Front-end')));

app.get('/', (req, res) => {
    res.send('Servidor funcionando. Intento de conexion DB movido.');
});

// ------------------------------------
// Inicia el servidor
// ------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

    // 🔑 VERIFICACIÓN DE CONEXIÓN A LA DB (NO BLOQUEANTE)
    // Se ejecuta después de que el servidor esté listando.
    (async () => {
        try {
            const connection = await db.tienda.getConnection();
            console.log(`✅ Conexión con DB (Pool) '${process.env.DB_NAME || 'tienda'}' verificada.`);
            connection.release(); 
        } catch (err) {
            console.error(`❌ Fallo crítico en la verificación inicial del Pool:`, err.message);
        }
    })();
});