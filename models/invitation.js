const db = require('../db');

var invitation = {

    /**
     * 
     * @param {*} idGroup 
     * @param {*} callback 
     */
    deleteAllInvitation : function (idGroup, callback) {
        let sql = "DELETE FROM invitation WHERE FK_idGrp = ?";
        return db.query(sql,[idGroup],callback);
    },

    /**
     * 
     * @param {number|string} idfrom 
     * @param {number|string} idto 
     * @param {number|string} idgrp 
     * @param {*} callback callback function to handle errors and returned rows
     * @description insert an invitation to the user with the id idto for the group with
     * the id idgrp sends by the user with id idfrom.
     */
    invitMember : function (idfrom,idto,idgrp, callback) {
        let sql = "INSERT INTO invitation(FK_from, FK_to, FK_idGrp, invitationDate) VALUES (?,?,?,?)";
        var date = new Date();
        return db.query(sql, [idfrom, idto, idgrp, date], callback);
    },

    /**
     * 
     * @param {number|string} idinvit the id of the invitation
     * @param {number|string} grpid the id of the group
     * @param {number|string} userid the id of user
     * @param {*} callback callback function to handle errors and returned rows
     * @description update the invitation with id idInvitation to 1 for accepted
     */
    accept :function (idinvit,grpid,userid,callback) {
        let sql = "UPDATE invitation SET accepted = 1 WHERE idInvitation=? AND FK_idGrp=? AND FK_to=?";
        return db.query(sql,[idinvit,grpid,userid],callback)
    },

    /**
     * 
     * @param {number|string} userid the user id
     * @param {*} callback callback function to handle errors and returned rows
     * @description gives all the invitation received by the user with the id userid
     */
    getInvitations : function (userid, callback) {
        let sql = "SELECT idInvitation, username as sender, FK_idGrp, grpName, invitationDate FROM user,invitation,grp WHERE FK_idGrp=idGrp AND FK_from=idUser AND accepted=0 AND FK_to=?";
        return db.query(sql, [userid],callback);
    },

    /**
     * 
     * @param {number|string} idto the user id
     * @param {number|string} idgrp the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description Check if there is not already and inivitation sends to the user
     * with the id idto for the group with the id idgrp 
     */
    checkAlreadySend: function (idto,idgrp,callback) {
        let sql = "SELECT COUNT(idInvitation) as count FROM invitation WHERE accepted=0 AND FK_to=? AND FK_idGrp=?";
        return db.query(sql,[idto,idgrp], callback);        
    },

    /**
     * 
     * @param {number|string} idgrp the group id
     * @param {number|string} userid the user id
     * @param {*} callback callback function to handle errors and returned rows
     * @description Check id the user with the id userid is not already in the group with the id idgrp 
     */
    checkAlreadyMember : function (idgrp,userid,callback) {
        let sql = "SELECT COUNT(FK_idGrp) as count FROM belong_to WHERE FK_idGrp=? AND FK_idUser=?";
        return db.query(sql,[idgrp,userid],callback);
    },

    /**
     * 
     * @param {number|string} idInvitation the invitation id 
     * @param {*} callback callback function to handle errors and returned rows
     * @description Delete the invitation idInvitation from the database
     */
    deleteInvitation : function (idInvitation,callback) {
        let sql = "DELETE FROM invitation WHERE idInvitation=?";
        return db.query(sql,[idInvitation],callback)
    }
}

module.exports = invitation;