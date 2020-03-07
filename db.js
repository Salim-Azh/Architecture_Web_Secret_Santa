let mysql = require('mysql');

//Conection pool makes enhance the performance
// No need to connect and end connection to the db 
let connection = mysql.createPool({
    connectionLimit : 5,
    host: "eu-cdbr-west-02.cleardb.net",
    user: "b65b8b952928c2",
    password: "30c1afef",
    database : "heroku_ec8dce0b3e6fb36"
});

module.exports = connection;