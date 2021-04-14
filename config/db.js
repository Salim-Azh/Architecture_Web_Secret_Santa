const mysql = require('mysql');
require('dotenv').config({path: './config/.env'})

//Conection pool makes enhance the performance
// No need to connect and end connection to the db 
let connection = mysql.createPool({
    connectionLimit : process.env.CONNECTION_LIMIT,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database : process.env.DATABASE
})
connection.getConnection((err, conn) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (conn){
        console.log("Connected to database")
        conn.release()
    }
    return
})

/*.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Failed to connect to MongoDB', err))*/

module.exports = connection;