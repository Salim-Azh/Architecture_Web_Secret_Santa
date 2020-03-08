const db = require('../db');
 
// ? escapes injection

var user = {
    updateUser : function(user, callback){
        let sql = "UPDATE user SET username=?,mail=?,pwd=? WHERE idUser=?";
        return db.query(sql, [user.username,user.mail,user.pwd,user.id], callback);
    },

    /**
     * 
     * @param {*} user object containing username, mail and pwd of the user to create
     * @param {*} callback callback function to handle errors and returned rows
     * @description create the user in the database
     */
    createUser : function (user,callback) {
        let sql = "INSERT INTO user(username, mail, pwdHash, salt) VALUES (?,?,?,?)";
        return db.query(sql, [user.username, user.mail, user.pwd, user.salt], callback);
    },

    /**
     * 
     * @param {*} user object containing the user mail
     * @param {*} callback callback function to handle errors and returned rows
     * @description select all user data in the database with the email mail.
     */
    getUserByEmail : function (user,callback) {
        let sql = "Select * From user Where mail = ?";
        return db.query(sql, [user.mail],callback);
    },

    /**
     * 
     * @param {string} username user username 
     * @param {*} callback callback function to handle errors and returned rows
     * @description check if a user with the same user name already exist in the
     * database
     */
    checkUsernameExist : function (username, callback) {
        let sql = "Select username From user Where username = ?";
        return db.query(sql, [username], callback)
    },

    /**
     * 
     * @param {string} mail user email address
     * @param {*} callback callback function to handle errors and returned rows
     * @description check if a user with the same mail exist in the database
     */
    checkMailExist : function (mail, callback) {
        let sql = "Select username From user Where mail=?";
        return db.query(sql,[mail], callback)  
    },

    /**
     * 
     * @param {string} username the user username
     * @param {*} callback callback function to handle errors and returned rows
     * @description select the user id with the username 'username'
     */
    getUserIdByUsername  : function (username,callback) {
        let sql = "SELECT idUser FROM user WHERE username=?";
        return db.query(sql,[username], callback)
    },

    /**
     * 
     * @param {number|string} userid the user id
     * @param {*} callback callback function to handle errors and returned rows
     * @description gives the username of the user with the id userid
     */
    getUserName : function (userid, callback) {
        let sql = "SELECT username FROM user WHERE idUser = ?";
        return db.query(sql, [userid], callback);
    }
}

module.exports = user;