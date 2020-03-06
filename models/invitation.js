const db = require('../db');

var invitation = {
    deleteAllInvitation : function (idGroup, callback) {
        let sql = "DELETE FROM invitation WHERE FK_idGrp = ?";
        return db.query(sql,[idGroup],callback);
    },
    invitMember : function (idfrom,idto,idgrp, callback) {
        let sql = "INSERT INTO invitation(FK_from, FK_to, FK_idGrp, invitationDate) VALUES (?,?,?,?)";
        var date = new Date();
        return db.query(sql, [idfrom, idto, idgrp, date], callback);
    },
    accept :function (idinvit,grpid,userid,callback) {
        let sql = "UPDATE invitation SET accepted = 1 WHERE idInvitation=? AND FK_idGrp=? AND FK_to=?";
        return db.query(sql,[idinvit,grpid,userid],callback)
    },
    getInvitations : function (userid, callback) {
        let sql = "SELECT idInvitation, username as sender, FK_idGrp, grpName, invitationDate FROM user,invitation,grp WHERE FK_idGrp=idGrp AND FK_from=idUser AND accepted=0 AND FK_to=?";
        return db.query(sql, [userid],callback);
    },
    checkAlreadySend: function (idto,idgrp,callback) {
        let sql = "SELECT COUNT(idInvitation) as count FROM invitation WHERE accepted=0 AND FK_to=? AND FK_idGrp=?";
        return db.query(sql,[idto,idgrp], callback);        
    },
    checkAlreadyMember : function (idgrp,userid,callback) {
        let sql = "SELECT COUNT(FK_idGrp) as count FROM belong_to WHERE FK_idGrp=? AND FK_idUser=?";
        return db.query(sql,[idgrp,userid],callback);
    },
    deleteInvitation : function (idInvitation,callback) {
        let sql = "DELETE FROM invitation WHERE idInvitation=?";
        return db.query(sql,[idInvitation],callback)
    }
}

module.exports = invitation;