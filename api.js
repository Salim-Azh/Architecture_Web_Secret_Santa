const user = require("./models/user");
const list = require("./models/list");
const group = require("./models/group");
const jwt = require('jsonwebtoken');
const datetime = require('./dateTimeFormat');
const gift = require('./models/gift');
const invitation = require('./models/invitation')
const memberRemover = require('./removeGrpMember');
const tokenChecker = require('./checkToken')
const crypto = require('crypto');


/*
tokenChecker.checkToken() is a middleware. 
Execute before the request callback process, it allows to
confirm jwt token validity and store user id in 
the request. acessible by req.id
*/

const InternalServerError = 500;
const NotAllowed = 405;
const NotFound = 404
const Ok = 200;
const Conflict=409;
const Created = 201;
const Unauthorized = 401;
const BadRequest =400;

/**
 * @param {Router} router is an intance of Router
 * @description check all routes and http methods apply the corresponding process
 * set the response and end   
 */
var routing = function (router) {

    /**
     * checks if the list with the id :id
     * is one of the client that send the request
     */
    router.route("/check/lists/:id")
        .get(tokenChecker.checkToken,function (req,res) {
            list.checkListOwner(req.id,req.params.id,function (err, rows) {
                if (err) {
                    res.statusCode = InternalServerError;
                    res.end();
                }
                else{
                    if (rows[0].count == 0) {
                        res.statusCode = NotFound;
                        res.end(JSON.stringify("Vous n'avez pas l'autorisation pour accéder à cette ressources"));
                    }
                    else{
                        res.statusCode= Ok;
                        res.end(JSON.stringify(rows[0].count));
                    }
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end()
        });

    /**
     * same as above but for the group
     * checks if the user belong to the group with
     * id :id
     */
    router.route("/check/groups/:id")
        .get(tokenChecker.checkToken,function (req,res) {
            group.checkGroupAccess(req.id,req.params.id,function (err, rows) {
                if (err) {
                    res.statusCode = InternalServerError;
                    res.end();
                }
                else{
                    if (rows[0].count == 0) {
                        res.statusCode = NotFound;
                        res.end(JSON.stringify("Vous n'avez pas l'autorisation pour accéder à cette ressources"));
                    }
                    else{
                        res.statusCode= Ok;
                        res.end(JSON.stringify(rows[0].count));
                    }
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed
            res.end()
        });

    /**
     * register the user on the app check for email username and pwd validity
     * and create the user in the database
     */
    router.route('/register')
        .post(function (req, res) {
            let body = [];
            req.on('error', (err) => {
                res.statusCode =InternalServerError;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                user.checkMailExist(body.mail, function (err, rows) {
                    if (err) {
                        res.statusCode=InternalServerError;
                        res.end();
                    }
                    if (rows.length != 0) { //If the mail is already used
                        res.statusCode = Conflict;
                        res.end(JSON.stringify("Cette email est déjà enregistré"))
                    }
                    else{
                        user.checkUsernameExist(body.username, function (err1, rows1) {
                            if (err1) {
                                res.statusCode = InternalServerError;
                                res.end();
                            }
                            if (rows1.length != 0) { //if the username is already used
                                res.statusCode = Conflict;
                                res.end(JSON.stringify("Ce nom d'utilisateur existe déjà"))
                            }
                            else{
                                const genRandomString = function(length){
                                    return crypto.randomBytes(Math.ceil(length/2))
                                            .toString('hex') /** convert to hexadecimal format */
                                            .slice(0,length);   /** return required number of characters */
                                };

                                let salt = genRandomString(25);
                                let hash = crypto.createHmac('sha512', salt)
                                                .update(body.pwd)
                                                .digest('hex');
                                body.pwd = hash;
                                body.salt = salt;
                                user.createUser(body, function (err2, rows2) {
                                    if (err2) {
                                        res.statusCode =InternalServerError;
                                        res.end();
                                    }
                                    else{
                                        res.statusCode = Created;
                                        res.end(JSON.stringify("Votre compte a été créé"));
                                    }
                                })
                            }
                        })
                    }
                })
            });
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end()
        });

    /**
     * log the user in the app after checking for login and password validity
     */
    router.route('/login')
        .post(function (req, res) {
            let body = [];
            req.on('error', (err) => {
                res.statusCode =InternalServerError;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                user.getUserByEmail(body, function (err, user) {
                    let row = JSON.parse(JSON.stringify({user}));
                    if (err) {
                        res.statusCode =InternalServerError;
                        res.end();
                    } 
                    if(row.user.length == 0){
                        res.statusCode = Unauthorized;
                        res.end('Invalid email');
                    }
                    else{
                        const hash = row.user[0].pwdHash;
                        const salt = row.user[0].salt;

                        let hash2 = crypto.createHmac('sha512', salt).update(body.pwd).digest('hex');

                        if (hash === hash2) {
                            let body = row.user[0];
                            // JWT token generation
                            let payload = { subject: body.idUser };
                            let token = jwt.sign(payload, tokenChecker.key);
                            res.statusCode = Ok;
                            res.end(JSON.stringify({token}));
                        } else {
                            res.statusCode = Unauthorized;
                            res.end('Invalid password');
                        }
                    }
                });
    
            });
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end()
        });
    
    /**
     * if GET request gives all the user lists it means id, name, 
     * and last modification date foreach user lists'. If POST request then create a list
     * with the given name. 
     */
    router.route('/mylists')
        .get(tokenChecker.checkToken ,function (req, res) {
            list.getAllUserList(req.id, function (err, rows) {
                if(err){
                    res.statusCode =InternalServerError;
                    res.end();
                }
                else{
                    //Convert query result in JS object
                    rows = JSON.parse(JSON.stringify(rows));
                    //iterate over the rows and reformat the date
                    rows = datetime.format(rows, 'listModifDate', true);
                    res.end(JSON.stringify({rows}));
                }
            });
        })
        .post(tokenChecker.checkToken, function (req, res) {
            let body = [];
            req.on('error', (err) => {
                res.statusCode = InternalServerError;
                res.end()
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                list.createList(req.id,body.name, function (err, rows) {
                    if (err) {
                        res.statusCode =InternalServerError;
                        res.end();
                    }
                    else{
                        res.statusCode=Created;
                        res.end(JSON.stringify("La liste a été créée"));
                    }
                });
            });
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end();
        });

    /**
     * if DELETE delete the list :id. 
     * if PUT if the body is empty remove the liste from the groupe
     * if not share the list in the group. 
     */
    router.route('/mylists/:id')
        .delete(tokenChecker.checkToken,function (req,res) {
            // first remove all the list gifts'
            list.deleteListGifts(req.params.id,function(err, rows) {
                if (err) {
                    res.statusCode = InternalServerError;
                    res.end();
                }
                else{
                    // then delete the list in the list table
                    list.deleteList(req.params.id, function (err1,rows1) {
                        if (err1) {
                            res.statusCode=InternalServerError;
                            res.end();
                        }
                        else{
                            res.end(JSON.stringify("La liste a été supprimée"));
                        }
                    })
                }
            })
            
        })
        .put(tokenChecker.checkToken,function (req,res) {
            let body = [];
            req.on('error', (err) => {
                res.statusCode = InternalServerError;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(JSON.stringify(body));
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                if (body) { //If the body is not null undefined or 0 
                    //it contains the group id
                    list.share(req.params.id, body, function (err,rows) {
                        if (err) {
                            res.statusCode=InternalServerError;
                            res.end();
                        } 
                        else {
                            res.end(JSON.stringify("Votre liste a bien été partagée"))
                        }
                    }) 
                } 
                else { //if PUT body is empty then remove the list from the group
                   list.removeGrp(req.params.id,function (err,rows) {
                        if (err) {
                            res.statusCode = InternalServerError;
                            res.end();
                        } 
                        else {
                            // and reset gift selection for this list 
                            gift.removeListBuyers(req.params.id,function (err1,rows1) {
                                if (err1) {
                                    res.statusCode = InternalServerError;
                                    res.end();
                                }
                                else {
                                    res.end(JSON.stringify("La liste a bien été retirée du groupe"));
                                }
                           })
                       }
                   }) 
                }     
            });
        })
        .all(function (req,res) {
            res.statusCode = NotAllowed;
            res.end();
        });

    /**
     * UPDATE the gift for gift selection request
     */
    router.route('/mylists/details/selectgift')
        .put(tokenChecker.checkToken,function(req,res){
            let body = [];
            req.on('error', (err) => {
                res.statusCode = NotAllowed;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                let idgift = body.idGift;
                let idList = body.idList;
                
                if (body.cancel) { //cancel gift selection
                    gift.removeBuyer(idList,idgift, function (err,rows) {
                        if (err) {
                            res.statusCode = NotAllowed;
                            res.end();  
                        }
                        else {
                            res.end(JSON.stringify("Le cadeau a été retiré de votre sélection"));
                        }
                    })
                } 
                else { //select gift
                    gift.updateBuyer(req.id, idList,idgift, function (err,rows) {
                        if (err) {
                            res.statusCode = NotAllowed;
                            res.end();    
                        }
                        else {
                            res.end(JSON.stringify("Le cadeau a été sélectionné"));
                        }
                    })
                }
            })
        })
        .all(function (req,res) {
            res.statusCode = NotAllowed;
            res.end();
        });

    /**
     * gives a user list details for a group
     */
    router.route('/mylists/details/grp/:id')
        .get(tokenChecker.checkToken,function (req, res) {
            let listid = req.params.id;
            //first get all the gifts with no buyer
            gift.getNotSelectedGifts(listid, function (err, rows) {
                if(err){
                    res.statusCode=InternalServerError;
                    res.end();
                }
                else{
                    //then the listName
                    list.getListName(listid, function (err1, rows1) {
                        if (err1) {
                            res.statusCode = InternalServerError;
                            res.end();
                        }
                        else{
                            // then get all the gifts with a buyer
                            gift.getSelectedGifts(listid,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode=InternalServerError;
                                    res.end()
                                }
                                else{
                                    //merge the results
                                    rows = JSON.parse(JSON.stringify(rows)); // the list gift's with no selection
                                    rows1 = JSON.parse(JSON.stringify(rows1)); //the list name
                                    rows2 = JSON.parse(JSON.stringify(rows2)); //the list selected gifts
                                    
                                    if (rows2.length>0) { //if this table is not empty
                                        //the for each rows2 we push the result at very end of the first result to merge them
                                        for (let i = 0; i < rows2.length; i++) {
                                            rows[rows.length] = rows2[i]
                                        }
                                    }
                                    //finally merge th list name
                                    rows[rows.length]=rows1[0];                                    
                                    //return the final response
                                    res.end(JSON.stringify({rows}));
                                }
                            })
                        }
                    });
                }
            });
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end()
        });

    /**
     *  if GET gives the user list details
     *  if POST create a gift 
     */
    router.route('/mylists/details/:id')
        .get(tokenChecker.checkToken,function (req, res) {
            let listid = req.params.id;
            //first get all gift
            gift.getListGifts(listid, function (err, rows) {
                if(err){
                    res.statusCode=InternalServerError;
                    res.end();
                }
                else{
                    //then the listName
                    list.getListName(listid, function (err1, rows1) {
                        if (err1) {
                            res.statusCode = InternalServerError;
                            res.end();
                        }
                        else{
                            list.getListGroup(listid,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode=InternalServerError;
                                    res.end()
                                }
                                else{
                                    //merge the rows and rows1 
                                    rows = JSON.parse(JSON.stringify(rows)); //all the list gifts'
                                    rows1 = JSON.parse(JSON.stringify(rows1)); //list name
                                    rows2 = JSON.parse(JSON.stringify(rows2)); //group data
                                    
                                    rows[rows.length] = rows1[0];
                                    if (rows2[0]) { // if there is a group
                                        rows[rows.length] = rows2[0].FK_idGrp;
                                        rows[rows.length] = rows2[0].grpName;
                                    }//if not
                                    else{
                                        rows[rows.length] = null;
                                        rows[rows.length] = null;
                                    }
                                    //return the final response
                                    res.end(JSON.stringify({rows}));
                                }
                            })
                        }
                    });
                }
            });
        })
        .post(tokenChecker.checkToken,function(req,res){
            let body = [];
            req.on('error', (err) => {
                res.statusCode=InternalServerError;
                res.end()
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                if(!body.giftName || !body.FK_idList){
                    res.statusCode = BadRequest;
                    res.end();
                }
                if(!body.giftPrice) {
                    body.giftPrice = null;
                }
                if(!body.giftDescription){
                    body.giftDescription = null;
                }
                if (!body.giftUrl) {
                    body.giftUrl = null
                }
                //firt calcultion of the new gift id
                gift.getGiftIdForInsert(body.FK_idList, function (err,rows) {
                    if (err) {
                        res.statusCode =InternalServerError;
                        res.end();
                    }
                    
                    rows = JSON.parse(JSON.stringify(rows));
                    let giftId=-1; 
                    if (rows[0].idGift) {
                       giftId = rows[0].idGift;
                    }
                    else{
                       giftId = 1;
                    }
                    //then create the gift
                    gift.createGift(giftId,body,function (err1,rows1) {
                        if (err1) {
                            res.statusCode =InternalServerError;
                            res.end();
                        }
                        //when the gift is created we update the list date modif
                        list.updateListDate(body.FK_idList,function (err,rows) {
                            if (err) {
                                res.statusCode = InternalServerError;
                                res.end(err);
                            }
                            else{
                                res.statusCode = Created;
                                res.end(JSON.stringify('Le cadeau a été créé'));
                            }
                            
                        })
                    })
                })
                
            });
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end();
        });
    
    /**
     * if DELETE then delete the gift
     * if PUT then update the gift
     */
    router.route('/mylists/details/:idl/:idg')
        .delete(tokenChecker.checkToken, function(req,res) {
            gift.deleteGift(req.params.idl,req.params.idg,function (err,rows) {
                if (err) {
                    res.statusCode =InternalServerError;
                    res.end(err);
                }
                //the we update the list date modif
                list.updateListDate(req.params.idl,function (err,rows) {
                    if (err) {
                        res.statusCode = InternalServerError;
                        res.end(err);
                    }
                    res.end();
                })
            })
        })
        .put(tokenChecker.checkToken, function(req,res){
            let body = [];
            req.on('error', (err) => {
                res.statusCode = InternalServerError;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                
                if(!body.giftName || !body.FK_idList){
                    res.statusCode = BadRequest;
                    res.end();
                }
                if(!body.giftPrice) {
                    body.giftPrice = null;
                }
                if(!body.giftDescription){
                    body.giftDescription = null;
                }
                if (!body.giftUrl) {
                    body.giftUrl = null
                }
                gift.updateGift(body,function (err, rows) {
                    if (err) {
                        res.statusCode = InternalServerError;
                        res.end();
                    }
                    //when the gift is created we update the list date modif
                    list.updateListDate(body.FK_idList,function (err,rows) {
                        if (err) {
                            res.statusCode = InternalServerError;
                            res.end();
                        }
                        else{
                            res.end(JSON.stringify("Le cadeau a été modifié"));
                        }
                    })
                    
                }) 
            });
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed
            res.end()
        });
        
    /**
     * if POST creates a group 
     * if GET gives all user groups'
     */
    router.route('/groups')
        .post(tokenChecker.checkToken, function (req, res) {
            let body = [];
            req.on('error', (err) => {
                res.statusCode =InternalServerError;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                group.createGroup(body.name, function (err, rows) {
                    if (err) {
                        res.statusCode =InternalServerError;
                        res.end();
                    }
                    else{
                        // set the user who send the request as group admin in this new group
                        group.belongToCreation(req.id, rows.insertId, function (err1, rows1) {
                            if (err1) {
                                res.statusCode = InternalServerError;
                                res.end()
                            }
                            else{
                                res.statusCode=Created;
                                res.end(JSON.stringify("Le groupe a été créer avec succès"));
                            }
                        })
                    }
                    
                    
                });

            });
        })
        .get(tokenChecker.checkToken, function (req, res) {
            group.getAllUserGroup(req.id, function (err, rows) {
                if(err){
                    res.statusCode =InternalServerError;
                    res.end();
                }
                else if (rows) {
                    //Convert query result in JS object
                    rows = JSON.parse(JSON.stringify(rows));
                    //iterate over the rows and reformat the date
                    rows = datetime.format(rows, 'grpCreationDate',false);
                    res.end(JSON.stringify({rows}));
                }
                else{ //if the user have no group
                    res.end();
                }
            });
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end()
        });

    /**
     * gives all the groups where the user can share his list
     */
    router.route('/groups/toshare')
        .get(tokenChecker.checkToken,function (req,res) {
            group.getShareableGrp(req.id,function (err,rows) {
                if (err) {
                    res.statusCode=InternalServerError;
                    res.end();
                } else {
                    res.end(JSON.stringify(rows));
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end();
        });

    /**
     * when a user accept an invitation add him to the group
     */
    router.route('/groups/invitation')
        .post(tokenChecker.checkToken,function (req,res) {
            let body = [];
            req.on('error', () => {
                res.statusCode=InternalServerError;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                group.addMember(req.id,body.grpid,function (err,rows) {
                    if (err) {
                        res.statusCode=InternalServerError;
                        res.end();
                    }
                    else{
                        invitation.accept(body.id,body.grpid,req.id, function(err1,rows1) {
                            if (err1) {
                                res.statusCode=InternalServerError;
                                res.end();
                            }
                            else{
                                res.end(JSON.stringify("Invitation accepté"));
                            }
                        })
                    }
                })
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end();
        });


    /**
     * when a user refuse an invitation to a group
     */
    router.route('/groups/invitation/:idInv')
        .delete(tokenChecker.checkToken,function (req,res) {
            invitation.deleteInvitation(req.params.idInv,function (err,rows) {
                if(err){
                    res.statusCode=InternalServerError;
                    res.end();
                }
                else{
                    res.end(JSON.stringify("L'invitation a été supprimée"));
                    res.end();
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end()
        });
        
    /**
     * If GET gives groups details
     * If POST sends an invitation
     * IF DELETE delete the group 
     */    
    router.route('/groups/:id')
        .get(tokenChecker.checkToken,function(req,res) {
            group.getMembers(req.id,req.params.id, function (err,rows) {
                if (err) {
                    res.statusCode = InternalServerError;
                    res.end()
                }
                else if(rows){
                    group.getGroupName(req.params.id,function (err1,rows1) {
                        if (err1) {
                            res.statusCode = InternalServerError;
                            res.end();
                        }
                        else{
                            group.getUserSharedListId(req.id,req.params.id,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode = InternalServerError;
                                    res.end();
                                } 
                                else {
                                    //merge the rows and rows1 
                                    rows = JSON.parse(JSON.stringify(rows)); //group members except the one who send the request
                                    rows1 = JSON.parse(JSON.stringify(rows1)); //the group name
                                    rows2 = JSON.parse(JSON.stringify(rows2)); //the user shared list in this group

                                    rows[rows.length] = rows1[0];
                                    rows[rows.length] = rows2[0];
                                    //return the final response
                                    res.end(JSON.stringify({rows}));
                                }
                            })
                        }
                    })
                }
            })
        })
        .post(tokenChecker.checkToken,function(req,res) {
            let body = [];
            req.on('error', (err) => {
                res.statusCode=InternalServerError;
                res.end();
            });
            req.on('data', (chunk) => {
                body.push(chunk);
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString(); 
                //now body contains the request body as text
                body = JSON.parse(body);
                // And here we have the corresponding JS object
                // Then we call the function to query the db
                
                //first get user id
                user.getUserIdByUsername(body.username,function (err,rows) {
                    if (err) {
                        res.statusCode=InternalServerError;
                        res.end();
                    }
                    else{
                        let userid = rows[0].idUser 
                        //then chek if this user is not already in this group
                        invitation.checkAlreadyMember(req.params.id, userid, function (err2,rows2) {
                            if (err2) {
                                res.statusCode=InternalServerError;
                                res.end();
                            }
                            else if (rows2[0].count == 0){
                                //then look if there is no existing invitation already send to this user
                                // in this group
                                invitation.checkAlreadySend(userid,req.params.id,function (err3,rows3) {
                                    if (err3) {
                                        res.statusCode=InternalServerError;
                                        res.end()
                                    }
                                    else if(rows3[0].count == 0){
                                        //the invit the user to join the group
                                        invitation.invitMember(req.id, userid, req.params.id, function (err1,rows1) {
                                            if (err1) {
                                                res.statusCode=InternalServerError;
                                                res.end();
                                            }
                                            else{
                                                res.statusCode=Created;
                                                res.end(JSON.stringify("L'invitation a été envoyée à "+ body.username));
                                            }
                                        })
                                    }
                                    else{
                                        res.statusCode=Conflict;
                                        res.end(JSON.stringify("Une invitation a déjà été envoyée à "+body.username))
                                    }
                                })
                            }
                            else{
                                res.statusCode=Conflict;
                                res.end(JSON.stringify(body.username+" est déjà dans le groupe"));
                            }
                        })   
                    }
                    
                })  
            })
        })
        .delete(tokenChecker.checkToken, function(req,res) {
            let idGrp = req.params.id;
            //get all the group members'
            group.getMembers(req.id,idGrp,function (err,rows) {
                if (err) {
                    res.statusCode=InternalServerError;
                    res.end();
                } 
                else {
                    // for each selected member remove him from the group
                    for (let i = 0; i < rows.length; i++) {
                        let username=rows[i].username;
                        memberRemover.removeGrpMember(username,idGrp,res);
                    }
                    //then get the group admin username's
                    group.getAdminUsername(idGrp,function (err1,rows1) {
                        if (err1) {
                            res.statusCode=InternalServerError;
                            res.end();
                        }
                        else {
                            memberRemover.removeGrpMember(rows1[0].username,idGrp,res);
                            //finally delete all the invitation to the group
                            invitation.deleteAllInvitation(idGrp,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode=InternalServerError;
                                    res.end();
                                }
                                else {
                                    //and delete the group from database
                                    group.deleteGroup(idGrp,function (err3,rows3) {
                                        if (err3) {
                                            res.statusCode=InternalServerError;
                                            res.end();
                                        }
                                        else {
                                            res.end(JSON.stringify("Le groupe a été supprimé"));
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end();
        });


    /**
     * give the value of grpAdmin for one user in a group
     */
    router.route('/groups/admin/:id')
        .get(tokenChecker.checkToken,function (req,res) {
            group.isAdmin(req.id,req.params.id,function (err,rows) {
                if (err) {
                    res.statusCode = InternalServerError;
                    res.end()
                }
                else{
                    res.statusCode=Created;
                    res.end(JSON.stringify(rows[0].grpAdmin))
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end();
        });
    

    router.route('/groups/:idg/:username')
        .get(tokenChecker.checkToken,function (req,res) {
            let idGrp = req.params.idg;
            let username = req.params.username;
            //get the user shared list id
            list.getListId(idGrp,username,function (err,rows) {
                if (err) {
                    res.statusCode=InternalServerError;
                    res.end();
                }
                else {
                    res.end(JSON.stringify(rows));
                }
            })
        })
        //remove the user form the group
        .delete(tokenChecker.checkToken,function(req,res){
            let idGrp = req.params.idg;
            let username = req.params.username;
            memberRemover.removeGrpMember(username,idGrp,res);
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed
            res.end()
        });

    router.route('/home')
        .get(tokenChecker.checkToken, function (req, res) {
            user.getUserName(req.id,function (err,rows) {
                if (err) {
                    res.statusCode=InternalServerError;
                    res.end()
                }
                else{
                    res.end(JSON.stringify(rows[0].username))
                }
            })
        })
        .all(function (req, res) {
            res.statusCode =NotAllowed;
            res.end();
        });

    router.route('/home/invits')
        .get(tokenChecker.checkToken, function (req,res) {
            invitation.getInvitations(req.id,function (err,rows) {
                if (err) {
                    res.statusCode = InternalServerError;
                    res.end();
                }
                else {
                    rows = JSON.parse(JSON.stringify(rows));
                    //format the date
                    rows = datetime.format(rows, 'invitationDate', true);
                    res.end(JSON.stringify(rows));
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = NotAllowed;
            res.end();
        });
    
    //For same origin use of static server 
    const nodeStatic = require('node-static');
    const staticFile = new(nodeStatic.Server)('./public/'); // folder containing the build angular app

    router.route('*') // form anything else
    .get(function (req,res) {
        staticFile.serve(req,res); // serve the public (dist folder)
    })
}   

module.exports.routing = routing;