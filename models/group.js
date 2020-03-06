const db = require('../db');

var group = {
    checkGroupAccess : function(userid, grpid, callback) {
        let sql = "SELECT COUNT(FK_idGrp) as count FROM belong_to WHERE FK_idUser=? AND FK_idGrp=?";
        db.query(sql,[userid,grpid],callback);
    },
    getAllUserGroup : function (userid,callback) {
        let sql = "SELECT FK_idGrp, grpName, grpCreationDate, grpAdmin FROM belong_to, grp WHERE FK_idUser=? AND idGrp = FK_idGrp";
        return db.query(sql, [userid], callback);
    },
    createGroup : function (name, callback) {
        let sql = "INSERT INTO grp(grpName, grpCreationDate) VALUES (?,?)";
        var date = new Date();
        return db.query(sql, [name,date], callback)
    },
    belongToCreation : function (userid,grpid,callback) {
        let sql = "INSERT INTO belong_to(FK_idUser, FK_idGrp, grpAdmin) VALUES (?,?,?)";
        return db.query(sql,[userid,grpid,1], callback);
    },
    deleteGroup : function (idgrp, callback) {
        let sql = "DELETE FROM grp WHERE idGrp=?";
        return db.query(sql,[idgrp], callback)
    },
    getGroupName: function(idgrp,callback){
        let sql= "SELECT grpName FROM grp WHERE idGrp=?";
        return db.query(sql,[idgrp],callback)
    },
    getMembers : function (userid,idgrp,callback) {
        let sql = "SELECT username FROM user, belong_to WHERE idUser=FK_idUser AND FK_idGrp=? AND FK_idUser<>?";
        return db.query(sql,[idgrp, userid],callback);
    },
    isAdmin : function (userid,idgrp,callback) {
        let sql = "SELECT grpAdmin FROM belong_to WHERE FK_idUser=? AND FK_idGrp=?";
        return db.query(sql,[userid,idgrp],callback);
    },
    addMember: function (userid,grpid,callback) {
        let sql = "INSERT INTO belong_to(FK_idUser, FK_idGrp) VALUES (?,?)";
        return db.query(sql,[userid,grpid],callback)
    },
    getUserSharedListId : function(userid,grpid,callback){
        let sql = "SELECT idList FROM list WHERE FK_idUser=? AND FK_idGrp=?";
        return db.query(sql,[userid,grpid],callback);
    },
    getShareableGrp : function (userid,callback) {
        let sql= 
        "SELECT DISTINCT idGrp, grpName "+ 
        "FROM grp,belong_to,list "+
        "WHERE grp.idGrp= belong_to.FK_idGrp "+
        "AND belong_to.FK_idUser = list.FK_idUser "+
        "AND belong_to.FK_idUser=? "+ 
        "AND idGrp NOT IN ("+
        "  SELECT FK_idGrp "+
        "  FROM list "+
        "  WHERE list.FK_idUser=? "+
        "  AND FK_idGrp IS NOT NULL "+
        ")";
        return db.query(sql, [userid,userid], callback);
    },
    deleteMember : function (userid,grpid,callback) {
        let sql = "DELETE FROM belong_to WHERE FK_idUser=? AND FK_idGrp=?";
        return db.query(sql,[userid,grpid],callback);
    },
    getAdminUsername : function (idGrp,callback) {
        let sql="SELECT username FROM belong_to, user WHERE grpAdmin=1 AND FK_idGrp=? AND FK_idUser=idUser";
        return db.query(sql,[idGrp],callback);
    }
}

module.exports = group;