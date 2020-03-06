const db = require('../db');

var list = {
    checkListOwner : function(userid, listeid,callback){
        let sql = "SELECT COUNT(idList) as count FROM list WHERE FK_idUser=? AND idList=?"
        return db.query(sql,[userid,listeid], callback);
    },
    getAllUserList : function (userid,callback) {
        let sql = "SELECT idList, listName, listModifDate, FK_idGrp FROM list WHERE FK_idUser=?";
        return db.query(sql, [userid], callback);
    },
    createList : function (userid,name, callback) {
        let sql = "INSERT INTO list(FK_idUser, listName, listModifDate) VALUES (?,?,?);"
        var date = new Date(); 
        return db.query(sql, [userid,name,date], callback)
    },
    getListName : function (listid,callback) {
        let sql = "Select listName From list Where idList = ?";
        return db.query(sql, [listid], callback);
    },
    updateListDate : function (listid, callback) {
        let sql = "UPDATE list SET listModifDate=NOW() WHERE idList=?";
        return db.query(sql, [listid],callback);
    },
    deleteListGifts : function (listid, callback) {
        let sql = "DELETE FROM gift WHERE FK_idList = ?";
        return db.query(sql, [listid], callback);
    },
    deleteList : function (listid,callback) {
        let sql = "DELETE FROM list WHERE idList = ?";
        return db.query(sql,[listid],callback);       
    },
    share: function(listid, grpid,callback) {
        let sql= "UPDATE list SET FK_idGrp=? WHERE idList=?";
        return db.query(sql,[grpid,listid],callback);
    },
    getListGroup: function (listid,callback) {
        let sql = "SELECT FK_idGrp, grpName FROM list, grp WHERE FK_idGrp=idGrp AND idList=?";
        return db.query(sql,[listid],callback);
    },
    removeGrp: function (listid,callback) {
        let sql="UPDATE list SET FK_idGrp=NULL WHERE idList=?";
        return db.query(sql,[listid],callback);
    },
    getListId: function(idGrp,username,callback){
        let sql = "SELECT idList FROM list,user WHERE FK_idGrp=? AND FK_idUser=idUser AND username = ?";
        return db.query(sql,[idGrp,username],callback);
    },
    getAllListsId: function(idGrp,callback){
        let sql = "SELECT idList FROM list WHERE FK_idGrp=?";
        return db.query(sql,[idGrp],callback);
    }
}

module.exports = list;