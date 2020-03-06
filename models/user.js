const db = require('../db');
 
// ? escapes injection

var user = {
    updateUser : function(user, callback){
        let sql = "UPDATE user SET username=?,mail=?,pwd=? WHERE idUser=?";
        return db.query(sql, [user.username,user.mail,user.pwd,user.id], callback);
    },
    createUser : function (user,callback) {
        let sql = "INSERT INTO user(username, mail, pwd) VALUES (?,?,?)";
        return db.query(sql, [user.username, user.mail, user.pwd], callback);
    },
    getUserByEmail : function (user,callback) {
        let sql = "Select * From user Where mail = ?";
        return db.query(sql, [user.mail],callback);
    },
    checkUsernameExist : function (username, callback) {
        let sql = "Select username From user Where username = ?";
        return db.query(sql, [username], callback)
    },
    checkMailExist : function (mail, callback) {
        let sql = "Select username From user Where mail=?";
        return db.query(sql,[mail], callback)  
    },
    getUserIdByUsername  : function (username,callback) {
        let sql = "SELECT idUser FROM user WHERE username=?";
        return db.query(sql,[username], callback)
    },
    getUserName : function (userid, callback) {
        let sql = "SELECT username FROM user WHERE idUser = ?";
        return db.query(sql, [userid], callback);
    }
}

module.exports = user;