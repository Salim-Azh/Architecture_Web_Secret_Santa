const db = require('../db');

var gift = {
    getListGifts : function (listid,callback) {
        let sql = "SELECT idGift, giftName, giftUrl, giftDescription, giftPrice FROM gift WHERE FK_idList=?";
        return db.query(sql, [listid], callback);
    },
    createGift : function (giftid,data, callback) {
        let sql = "INSERT INTO gift(FK_idList, idGift, giftName, giftUrl, giftDescription, giftPrice) VALUES (?, ?, ?, ?, ?, ?)";
        return db.query(sql, [data.FK_idList, giftid, data.giftName, data.giftUrl,data.giftDescription,data.giftPrice], callback);
    },
    getGiftIdForInsert : function (listid, callback){
        let sql = "SELECT MAX(idGift)+1 as idGift From gift WHERE FK_idList = ?";
        return db.query(sql, [listid], callback);
    },
    deleteGift : function (idList,idGift,callback) {
        let sql = "DELETE FROM gift WHERE FK_idList = ? AND idGift = ?";
        return db.query(sql,[idList, idGift], callback);
    },
    updateGift : function (data, callback) {
        let sql = "UPDATE gift SET giftName=?, giftUrl=?, giftDescription=?, giftPrice=? WHERE FK_idList=? AND idGift = ?";
        return db.query(sql,[data.giftName, data.giftUrl,data.giftDescription,data.giftPrice, data.FK_idList, data.idGift], callback)
    },
    updateBuyer : function (userid, idList,giftid,callback) {
        let sql = "UPDATE gift SET FK_buyer=? WHERE idGift=? AND FK_idList=?";
        return db.query(sql,[userid,giftid,idList],callback);
    },
    getNotSelectedGifts : function (listid,callback) {
        let sql = "SELECT idGift, giftName, giftUrl, giftDescription, giftPrice FROM gift WHERE FK_idList=? AND FK_buyer IS NULL";
        return db.query(sql, [listid], callback);
    },
    getSelectedGifts : function (listid,callback) {
        let sql = "SELECT idGift, giftName, giftUrl, giftDescription, giftPrice, username FROM gift, user WHERE FK_idList=? AND FK_buyer = idUser";
        return db.query(sql, [listid], callback);
    },
    removeBuyer: function (idList,giftid,callback) {
        let sql = "UPDATE gift SET FK_buyer=NULL WHERE idGift=? AND FK_idList=?";
        return db.query(sql,[giftid,idList],callback);
    },
    removeListBuyers(idList,callback){
        let sql = "UPDATE gift SET FK_buyer=NULL WHERE FK_idList=?";
        return db.query(sql,[idList],callback);
    },
    removeBuyerOfGrp(userid,idList,callback){
        let sql="UPDATE gift SET FK_buyer=NULL WHERE FK_idList=? AND FK_buyer=?";
        return db.query(sql,[idList,userid],callback);
    }
}

module.exports = gift;