let mysql = require('mysql');

//Conection pool makes enhance the performance
// No need to connect and end connection to the db 
let connection = mysql.createPool({
    connectionLimit : 5,
    host: "localhost",
    user: "root",
    password: "",
    database : "secret_santa"
});

module.exports = connection;