const user = require("./models/user");
const list = require("./models/list");
const group = require("./models/group");
const gift = require('./models/gift');

var removeGrpMember = function (username,idGrp, res) {
    //first get the user ID
    user.getUserIdByUsername(username,function (err,rows) {
        if (err) {
            res.statusCode=500;
            res.end(err);
        }
        else {
            let userid = rows[0].idUser;
            
            //then delete this user form the group it means delete 
            //the corresponding row from belong_to table
            group.deleteMember(userid,idGrp,function (err1,rows1) {
                if (err1) {
                    res.statusCode=500;
    
                    res.end(JSON.stringify(err1));
                }
                else {
                    //then get the shared listId
                    list.getListId(idGrp,username,function (err2,rows2) {
                        if (err2) {
                            res.statusCode=500;
                            res.end(JSON.stringify(err2));
                        }
                        else {
                            let idList;
                            if (rows2[0]) {
                                idList = rows2[0].idList;
                            } else {
                                idList='';
                            }                 
                            //and remove the group key's in the list table
                            list.removeGrp(idList,function (err3,rows3) {
                                if (err3) {
                                    res.statusCode=500;
                                    res.end(JSON.stringify(err3));
                                }
                                else {
                                    //then remove all buyers form the shared list of gift
                                    gift.removeListBuyers(idList, function (err4,rows4) {
                                        if (err4) {
                                            res.statusCode=500;
                                            res.end(JSON.stringify(err4));
                                        }
                                        else {
                                            //finally get all the id of the 
                                            // lists shared in the group by other member 
                                            list.getAllListsId(idGrp,function (err5,rows5) {
                                                if (err5) {
                                                    res.statusCode=500;
                                                    res.end(JSON.stringify(err5));
                                                }
                                                else {
                                                    //and foreach shared list
                                                    for (let i = 0; i < rows5.length; i++) {
                                                        //remove the deleted member of buyer
                                                        gift.removeBuyerOfGrp(userid,rows5[i].idList,function (err6,rows6) {
                                                            if (err6) {
                                                                res.statusCode=500;
                                                                res.end(JSON.stringify(err6));
                                                            }
                                                        })
                                                    }
                                                    res.end(JSON.stringify(username+" a été retiré du groupe"))
                                                }
                                            })
                                        }
                                    })
                                }
                            })  
                        }
                    })
                }
            })
        }
    })
}

module.exports.removeGrpMember = removeGrpMember;
