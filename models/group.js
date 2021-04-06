const db = require('../config/db');

var group = {
    
    
    /**
     * 
     * @param {string | number} userid the user id
     * @param {string | number} grpid the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description count if a row exist in belong_to table for the user userid and 
     * the group grpid
     */
    checkGroupAccess : function(userid, grpid, callback) {
        let sql = "SELECT COUNT(FK_idGrp) as count FROM belong_to WHERE FK_idUser=? AND FK_idGrp=?";
        db.query(sql,[userid,grpid],callback);
    },

    /**
     * 
     * @param {string | number} userid the user id 
     * @param {*} callback callback function to handle errors and returned rows
     * @description select all the group where the user with the id userid is in
     */
    getAllUserGroup : function (userid,callback) {
        let sql = "SELECT FK_idGrp, grpName, grpCreationDate, grpAdmin FROM belong_to, grp WHERE FK_idUser=? AND idGrp = FK_idGrp";
        return db.query(sql, [userid], callback);
    },

    /**
     * 
     * @param {string} name the group name
     * @param {*} callback callback function to handle errors and returned rows
     * @description Insert a group in the database
     */
    createGroup : function (name, callback) {
        let sql = "INSERT INTO grp(grpName, grpCreationDate) VALUES (?,?)";
        var date = new Date(); //creation date
        return db.query(sql, [name,date], callback)
    },

    /**
     * 
     * @param {number|string} userid the user id
     * @param {*} grpid the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description Insert a userid with grpid in belong_to table of the database as group admin
     */
    belongToCreation : function (userid,grpid,callback) {
        let sql = "INSERT INTO belong_to(FK_idUser, FK_idGrp, grpAdmin) VALUES (?,?,?)";
        return db.query(sql,[userid,grpid,1], callback);
    },
    deleteGroup : function (idgrp, callback) {
        let sql = "DELETE FROM grp WHERE idGrp=?";
        return db.query(sql,[idgrp], callback)
    },

    /**
     * 
     * @param {number|string} idgrp the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description Selecte the name of the group with the id idgrp
     */
    getGroupName: function(idgrp,callback){
        let sql= "SELECT grpName FROM grp WHERE idGrp=?";
        return db.query(sql,[idgrp],callback)
    },
    
    /**
     * 
     * @param {number|string} userid the user id
     * @param {number|string} idgrp the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description Select all members username except the member who made the request
     */
    getMembers : function (userid,idgrp,callback) {
        let sql = "SELECT username FROM user, belong_to WHERE idUser=FK_idUser AND FK_idGrp=? AND FK_idUser<>?";
        return db.query(sql,[idgrp, userid],callback);
    },

    /**
     * 
     * @param {number|string} userid the user id
     * @param {number|string} idgrp the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select grpAdmin value's of the user with the id userid and the group groupid
     * @returns grpAdmin can be 0 or 1
     */
    isAdmin : function (userid,idgrp,callback) {
        let sql = "SELECT grpAdmin FROM belong_to WHERE FK_idUser=? AND FK_idGrp=?";
        return db.query(sql,[userid,idgrp],callback);
    },

    /**
     * 
     * @param {number|string} userid the user id 
     * @param {number|string} grpid the group id 
     * @param {*} callback callback function to handle errors and returned rows
     * @description insert the user with the id userid in the group with the id grpid
     */
    addMember: function (userid,grpid,callback) {
        let sql = "INSERT INTO belong_to(FK_idUser, FK_idGrp) VALUES (?,?)";
        return db.query(sql,[userid,grpid],callback)
    },
    /**
     * 
     * @param {number|string} userid the user id 
     * @param {number|string} grpid the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select the list id's that is shared in the the group grpid
     * and belongs to the user with the id userid
     */
    getUserSharedListId : function(userid,grpid,callback){
        let sql = "SELECT idList FROM list WHERE FK_idUser=? AND FK_idGrp=?";
        return db.query(sql,[userid,grpid],callback);
    },
    
    /**
     * 
     * @param {number|string} userid the user id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select the groups where the user is able to share his list
     * so the groupe where he have no list shared
     */
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

    /**
     * 
     * @param {number|string} userid the user id
     * @param {number|string} grpid the group id
     * @param {*} callback callback function to handle errors and returned rows
     * @description delete the member with id userid of the group with id grpid from belong_to table
     */
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