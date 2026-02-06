const express = require('express');
const sql = require('mssql');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de la base de datos Azure SQL usando variables de entorno
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Obligatorio para Azure
        trustServerCertificate: false
    }
};

// RUTA 1: Guardar datos (Protección contra SQL Injection)
app.post('/registrar', async (req, res) => {
    try {
        const { nombre, correo } = req.body;
        let pool = await sql.connect(dbConfig);
        
        // USO DE PARÁMETROS (Seguridad nivel Senior)
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, correo)
            .query('INSERT INTO Usuarios (nombre, correo) VALUES (@nombre, @correo)');

        res.send('<h1>¡Registro Exitoso!</h1><a href="/">Regresar</a>');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar en la base de datos.');
    }
});

// RUTA 2: Obtener datos para la tabla
app.get('/api/usuarios', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT nombre, correo, fecha_registro FROM Usuarios');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener datos" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
