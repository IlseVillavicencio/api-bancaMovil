const mysql = require('mysql2/promise');
require('dotenv').config();
async function connect() {
    try {
        
        const conn = await mysql.createConnection({
            'host': process.env.MYSQLHOST,
            'port': process.env.MYSQLPORT,
            'user':process.env.MYSQLUSER,
            'password': process.env.MYSQLPASSWORD,
            'database': process.env.MYSQLDATABASE
        });

        console.log('Conexion creada');
        return conn;

    } catch(err) {
        console.log('Ocurrio un error al intentar realizar la conexion: ' + err);
        throw err;
    }
}

module.exports = connect;