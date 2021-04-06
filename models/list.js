const db = require('../config/db');

const list = {
    /**
     * 
     * @param {string | number} userid the user id
     * @param {string|number} listeid the list id 
     * @param {*} callback callback function to handle errors and returned rows
     * @description count if a row exist in list table for the user userid and 
     * the list listid
     * @returns [{count : ''}] count is 0 or 1 
     */
    checkListOwner : function(userid, listeid,callback){
        let sql = "SELECT COUNT(idList) as count FROM list WHERE FK_idUser=? AND idList=?"
        return db.query(sql,[userid,listeid], callback);
    },

    /**
     * 
     * @param {number | string } userid the user id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select all the list of the user udserid in the database
     */
    getAllUserList : function (userid,callback) {
        let sql = "SELECT idList, listName, listModifDate, FK_idGrp FROM list WHERE FK_idUser=?";
        return db.query(sql, [userid], callback);
    },

    /**
     * 
     * @param {number |string} userid the user id
     * @param {string} name the list name
     * @param {*} callback callback function to handle errors and returned rows
     * @description insert the new list in the database
     */
    createList : function (userid,name, callback) {
        let sql = "INSERT INTO list(FK_idUser, listName, listModifDate) VALUES (?,?,?);"
        var date = new Date(); 
        return db.query(sql, [userid,name,date], callback)
    },

    /**
     * 
     * @param {number |string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select the list name where idList is listid
     */
    getListName : function (listid,callback) {
        let sql = "Select listName From list Where idList = ?";
        return db.query(sql, [listid], callback);
    },

    /**
     * 
     * @param {number|string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description update the last modification date of the list
     */
    updateListDate : function (listid, callback) {
        let sql = "UPDATE list SET listModifDate=NOW() WHERE idList=?";
        return db.query(sql, [listid],callback);
    },

    /**
     * 
     * @param {number |string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description Delete all the list gifts' in gift table 
     */
    deleteListGifts : function (listid, callback) {
        let sql = "DELETE FROM gift WHERE FK_idList = ?";
        return db.query(sql, [listid], callback);
    },
    
    /**
     * 
     * @param {nuber |string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description delete the list idlist from the database
     */
    deleteList : function (listid,callback) {
        let sql = "DELETE FROM list WHERE idList = ?";
        return db.query(sql,[listid],callback);       
    },
    
    /**
     * 
     * @param {number|string} listid the list id 
     * @param {*} grpid the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description share the list listid in the group grpid by updating list table in the database 
     */
    share: function(listid, grpid,callback) {
        let sql= "UPDATE list SET FK_idGrp=? WHERE idList=?";
        return db.query(sql,[grpid,listid],callback);
    },

    /**
     * 
     * @param {nuber |string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select group data where the list list is shared in
     */
    getListGroup: function (listid,callback) {
        let sql = "SELECT FK_idGrp, grpName FROM list, grp WHERE FK_idGrp=idGrp AND idList=?";
        return db.query(sql,[listid],callback);
    },
    /**
     * 
     * @param {number|string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description set group id to NULL for the list with listid id in the database
     */
    removeGrp: function (listid,callback) {
        let sql="UPDATE list SET FK_idGrp=NULL WHERE idList=?";
        return db.query(sql,[listid],callback);
    },
    
    /**
     * 
     * @param {number|string} idGrp the group id
     * @param {number|string} username the member username
     * @param {*} callback callback function to handle errors and returned rows
     * @description select the list id of the list shared in the group idGrp by 
     * the member with the username 'username'
     */
    getListId: function(idGrp,username,callback){
        let sql = "SELECT idList FROM list,user WHERE FK_idGrp=? AND FK_idUser=idUser AND username = ?";
        return db.query(sql,[idGrp,username],callback);
    },

    /**
     * 
     * @param {number|string} idGrp the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select all the list id of the lists shared in the group with the id idGrp
     */
    getAllListsId: function(idGrp,callback){
        let sql = "SELECT idList FROM list WHERE FK_idGrp=?";
        return db.query(sql,[idGrp],callback);
    }
}

module.exports = list;