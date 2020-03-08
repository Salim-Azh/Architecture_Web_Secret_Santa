const db = require('../db');

var gift = {
     /**
     * 
     * @param {number|string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select all the gifts of the list listid
     */
    getListGifts : function (listid,callback) {
        let sql = "SELECT idGift, giftName, giftUrl, giftDescription, giftPrice FROM gift WHERE FK_idList=?";
        return db.query(sql, [listid], callback);
    },

    /**
     * 
     * @param {number|string} giftid the gift id
     * @param {*} data object that contains the gift data
     * @param {*} callback callback function to handle errors and returned rows
     * @description insert the gift in the database
     */
    createGift : function (giftid,data, callback) {
        let sql = "INSERT INTO gift(FK_idList, idGift, giftName, giftUrl, giftDescription, giftPrice) VALUES (?, ?, ?, ?, ?, ?)";
        return db.query(sql, [data.FK_idList, giftid, data.giftName, data.giftUrl,data.giftDescription,data.giftPrice], callback);
    },

    /**
     * 
     * @param {number|string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description gives the correct id gift for the new gift of the list listid
     */
    getGiftIdForInsert : function (listid, callback){
        let sql = "SELECT MAX(idGift)+1 as idGift From gift WHERE FK_idList = ?";
        return db.query(sql, [listid], callback);
    },
    
    /**
     * 
     * @param {number|string} idList the list id
     * @param {number|string} idGift the gift id
     * @param {*} callback callback function to handle errors and returned rows
     * @description delete a gift from the database with the id idGift and idList
     */
    deleteGift : function (idList,idGift,callback) {
        let sql = "DELETE FROM gift WHERE FK_idList = ? AND idGift = ?";
        return db.query(sql,[idList, idGift], callback);
    },
    
    /**
     * 
     * @param {*} data object that contains the gift data. It also contains the gift id
     * @param {*} callback callback function to handle errors and returned rows
     * @description applies the new data to the existing gift
     */
    updateGift : function (data, callback) {
        let sql = "UPDATE gift SET giftName=?, giftUrl=?, giftDescription=?, giftPrice=? WHERE FK_idList=? AND idGift = ?";
        return db.query(sql,[data.giftName, data.giftUrl,data.giftDescription,data.giftPrice, data.FK_idList, data.idGift], callback)
    },

    /**
     * 
     * @param {number|string} userid the user id
     * @param {number|string} idList the list id
     * @param {number|string} giftid the gift id
     * @param {*} callback callback function to handle errors and returned rows
     * @description set the buyer to userid the gift with the id giftid in the list with the id idList
     */
    updateBuyer : function (userid, idList,giftid,callback) {
        let sql = "UPDATE gift SET FK_buyer=? WHERE idGift=? AND FK_idList=?";
        return db.query(sql,[userid,giftid,idList],callback);
    },

    /**
     * 
     * @param {number|string} listid the list id 
     * @param {*} callback callback function to handle errors and returned rows
     * @description select all the gifts of the list listid and no buyer
     */
    getNotSelectedGifts : function (listid,callback) {
        let sql = "SELECT idGift, giftName, giftUrl, giftDescription, giftPrice FROM gift WHERE FK_idList=? AND FK_buyer IS NULL";
        return db.query(sql, [listid], callback);
    },

    /**
     * 
     * @param {number|string} listid the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description select the gifts of the list listid that a user has selected 
     */
    getSelectedGifts : function (listid,callback) {
        let sql = "SELECT idGift, giftName, giftUrl, giftDescription, giftPrice, username FROM gift, user WHERE FK_idList=? AND FK_buyer = idUser";
        return db.query(sql, [listid], callback);
    },
    
    /**
     * 
     * @param {number|string} idList the list id
     * @param {number|string} giftid the gift id
     * @param {*} callback callback function to handle errors and returned rows
     * @description set the buyer to NULL for the gift with the id giftid in the list with the id idList
     */
    removeBuyer: function (idList,giftid,callback) {
        let sql = "UPDATE gift SET FK_buyer=NULL WHERE idGift=? AND FK_idList=?";
        return db.query(sql,[giftid,idList],callback);
    },
    
    /**
     * 
     * @param {number|string} idList the list id 
     * @param {*} callback callback function to handle errors and returned rows
     * @description set the buyer to NULL for every gift in the list with the id idList
     */
    removeListBuyers(idList,callback){
        let sql = "UPDATE gift SET FK_buyer=NULL WHERE FK_idList=?";
        return db.query(sql,[idList],callback);
    },

    /**
     * 
     * @param {number|string} userid the user id 
     * @param {number|string} idList the list id
     * @param {*} callback callback function to handle errors and returned rows
     * @description remove all the gifts selections made by the user with the id 
     * userid in the list with the id idList
     */
    removeBuyerOfGrp(userid,idList,callback){
        let sql="UPDATE gift SET FK_buyer=NULL WHERE FK_idList=? AND FK_buyer=?";
        return db.query(sql,[idList,userid],callback);
    }
}

module.exports = gift;