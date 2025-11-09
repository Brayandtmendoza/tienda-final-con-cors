// ========================================
// db.js (FINAL - SINCRONIZADO CON RAILWAY.ENV)
// ========================================
const mysql = require('mysql2/promise');

// 🔑 Configuración de conexión usando tus variables de entorno (MYSQL...)
const dbConfig = {
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    port: process.env.MYSQLPORT || 3306,
    database: process.env.MYSQLDATABASE || 'tienda', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// ------------------------------------
// 1. Crear Pool de Conexiones
// ------------------------------------
// Se inicializa de forma síncrona, pero no bloquea el hilo principal.
const tiendaPool = mysql.createPool(dbConfig);

// ------------------------------------
// 2. Exportación y Verificación de Conexión
// ------------------------------------
module.exports = {
    tienda: tiendaPool 
};

// Verificación de Conexión (Asíncrona y No Bloqueante, solo para log)
(async () => {
    let connection;
    try {
        connection = await tiendaPool.getConnection();
        console.log(`✅ Conexión con DB (Pool) '${dbConfig.database}' verificada.`);
        connection.release(); 
    } catch (err) {
        console.error(`❌ Fallo crítico en la verificación inicial del Pool:`, err.message);
        // Si el servidor funciona, pero esto falla, revisa tu firewall de Railway.
    }
})();