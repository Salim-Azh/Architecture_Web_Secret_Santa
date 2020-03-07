const user = require("./models/user");
const list = require("./models/list");
const group = require("./models/group");
const jwt = require('jsonwebtoken');
const datetime = require('./dateTimeFormat');
const gift = require('./models/gift');
const invitation = require('./models/invitation')
const memberRemover = require('./removeGrpMember');

/*
tokenChecker.checkToken() is a middleware. 
Execute before the request callback process, it allows to
confirm jwt token validity and store user id in 
the request. acessible by req.id
*/
const tokenChecker = require('./checkToken')

/**
 * 
 * @param {Router} router is an intance of Router
 * @description check all routes and http methods apply the corresponding process
 * set the response and end   
 */
var routing = function (router) {

    router.route("/check/lists/:id")
        .get(tokenChecker.checkToken,function (req,res) {
            list.checkListOwner(req.id,req.params.id,function (err, rows) {
                if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify(err));
                }
                else{
                    if (rows[0].count == 0) {
                        res.statusCode = 404;
                        res.end(JSON.stringify("Vous n'avez pas l'autorisation pour accéder à cette ressources"));
                    }
                    else{
                        res.statusCode= 200;
                        res.end(JSON.stringify(rows[0].count));
                    }
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route("/check/groups/:id")
        .get(tokenChecker.checkToken,function (req,res) {
            group.checkGroupAccess(req.id,req.params.id,function (err, rows) {
                if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify(err));
                }
                else{
                    if (rows[0].count == 0) {
                        res.statusCode = 404;
                        res.end(JSON.stringify("Vous n'avez pas l'autorisation pour accéder à cette ressources"));
                    }
                    else{
                        res.statusCode= 200;
                        res.end(JSON.stringify(rows[0].count));
                    }
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/register')
        .post(function (req, res) {
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                  
                ///status 409confict
                user.checkMailExist(body.mail, function (err, rows) {
                    if (err) {
                        res.statusCode=500;
                        res.end();
                    }
                    if (rows.length != 0) {
                        res.statusCode = 409;
                        res.end(JSON.stringify("Cette email est déjà enregistré"))
                    }
                    user.checkUsernameExist(body.username, function (err1, rows1) {
                        if (err) {
                            res.statusCode = 500;
                            res.end();
                        }
                        if (rows.length != 0) {
                            res.statusCode = 409;
                            res.end(JSON.stringify("Ce nom d'utilisateur existe déjà"))
                        }
                        user.createUser(body, function (err, rows2) {
                            if (err) {
                                res.statusCode =500;
                                res.end();
                            }
                            res.statusCode = 201;
                            res.end(JSON.stringify("Votre compte a été créé"));
                        })
                    })
                })
                user.createUser(body, function (err, rows) {
                    if (err) {
                        res.statusCode =500;
                        res.end();
                    }
                    res.statusCode = 201;
                    res.end();
                });
    
            });
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/login')
        .post(function (req, res) {
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                        res.statusCode =500;
                        res.end();
                    } 
                    if(user.length == 0){
                        res.statusCode = 401;
                        res.end('Invalid email');
                    } 
                    else if(row.user[0].pwd != body.pwd){
                        res.statusCode = 401;
                        res.end('Invalid password');
                    }
                    else{
                        let body = row.user[0];
                        // JWT token generation
                        let payload = { subject: body.idUser };
                        let token = jwt.sign(payload, tokenChecker.key);
                        res.statusCode = 200;
                        res.end(JSON.stringify({token}));
                    }
                });
    
            });
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });
    
    router.route('/mylists')
        .get(tokenChecker.checkToken ,function (req, res) {
            list.getAllUserList(req.id, function (err, rows) {
                if(err){
                    res.statusCode =500;
                    res.end();
                }
                //Convert query result in JS object
                rows = JSON.parse(JSON.stringify(rows));
                //iterate over the rows and reformat the date
                rows = datetime.format(rows, 'listModifDate', true);
                res.end(JSON.stringify({rows}));
            });
        })
        .post(tokenChecker.checkToken, function (req, res) {
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                        res.statusCode =500;
                        res.end();
                    }
                    res.statusCode=201;
                    res.end(JSON.stringify({rows}));
                });
            });
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/mylists/:id')
        .delete(tokenChecker.checkToken,function (req,res) {
            list.deleteListGifts(req.params.id,function(err, rows) {
                if (err) {
                    res.statusCode = 500;
                    res.end();
                }
                else{
                    list.deleteList(req.params.id, function (err1,rows1) {
                        if (err1) {
                            res.statusCode=500;
                            res.end()
                        }
                        else{
                            res.end(JSON.stringify("La liste a été supprimée"))
                        }
                    })
                }
            })
            
        })
        .put(tokenChecker.checkToken,function (req,res) {
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                if (body) {
                    list.share(req.params.id, body, function (err,rows) {
                        if (err) {
                            res.statusCode=500;
                            res.end();
                        } 
                        else {
                            res.end(JSON.stringify("Votre liste a bien été partagée"))
                        }
                    }) 
                } 
                else {
                   list.removeGrp(req.params.id,function (err,rows) {
                        if (err) {
                            res.statusCode = 500;
                            res.end()
                        } 
                        else {
                            gift.removeListBuyers(req.params.id,function (err1,rows1) {
                                if (err1) {
                                    res.statusCode = 500;
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
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/mylists/details/selectgift')
        .put(tokenChecker.checkToken,function(req,res){
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                
                if (body.cancel) {
                    gift.removeBuyer(idList,idgift, function (err,rows) {
                        if (err) {
                            res.statusCode=500;
                            res.end();    
                        }
                        else {
                            res.end(JSON.stringify("Le cadeau a été retiré de votre sélection"));
                        }
                    })
                } 
                else {
                    gift.updateBuyer(req.id, idList,idgift, function (err,rows) {
                        if (err) {
                            res.statusCode=500;
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
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/mylists/details/grp/:id')
        .get(tokenChecker.checkToken,function (req, res) {
            let listid = req.params.id;
            //first get all gift
            gift.getNotSelectedGifts(listid, function (err, rows) {
                if(err){
                    res.statusCode=500;
                    res.end();
                }
                else{
                    //then the listName
                    list.getListName(listid, function (err1, rows1) {
                        if (err1) {
                            res.statusCode = 500;
                            res.end();
                        }
                        else{
                            gift.getSelectedGifts(listid,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode=500;
                                    res.end()
                                }
                                else{
                                    //merge the results
                                    rows = JSON.parse(JSON.stringify(rows));
                                    rows1 = JSON.parse(JSON.stringify(rows1));
                                    rows2 = JSON.parse(JSON.stringify(rows2));
                                    
                                    if (rows2.length>0) {
                                        for (let i = 0; i < rows2.length; i++) {
                                            rows[rows.length] = rows2[i]
                                        }
                                    }
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
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/mylists/details/:id')
        .get(tokenChecker.checkToken,function (req, res) {
            let listid = req.params.id;
            //first get all gift
            gift.getListGifts(listid, function (err, rows) {
                if(err){
                    res.statusCode=500;
                    res.end();
                }
                else{
                    //then the listName
                    list.getListName(listid, function (err1, rows1) {
                        if (err1) {
                            res.statusCode = 500;
                            res.end();
                        }
                        else{
                            list.getListGroup(listid,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode=500;
                                    res.end()
                                }
                                else{
                                    //merge the rows and rows1 
                                    rows = JSON.parse(JSON.stringify(rows));
                                    rows1 = JSON.parse(JSON.stringify(rows1));
                                    rows2 = JSON.parse(JSON.stringify(rows2));
                                    
                                    rows[rows.length] = rows1[0];
                                    if (rows2[0]) {
                                        rows[rows.length] = rows2[0].FK_idGrp;
                                        rows[rows.length] = rows2[0].grpName;
                                    }
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
                throw err;
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
                    res.statusCode = 400;
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
                gift.getGiftIdForInsert(body.FK_idList, function (err,rows) {
                    if (err) {
                        res.statusCode =500;
                        res.end(err);
                    }
                    
                    rows = JSON.parse(JSON.stringify(rows));
                    let giftId=-1; 
                    if (rows[0].idGift) {
                       giftId = rows[0].idGift;
                    }
                    else{
                       giftId = 1;
                    }
                    gift.createGift(giftId,body,function (err1,rows1) {
                        if (err1) {
                            res.statusCode =500;
                            res.end(JSON.stringify(err1));
                        }
                        //when the gift is created we update the list date modif
                        list.updateListDate(body.FK_idList,function (err,rows) {
                            if (err) {
                                res.statusCode = 500;
                                res.end(err);
                            }
                            res.statusCode = 201;
                            res.end();
                        })
                    })
                })
                
            });
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });
    
    router.route('/mylists/details/:idl/:idg')
        .delete(tokenChecker.checkToken, function(req,res) {
            gift.deleteGift(req.params.idl,req.params.idg,function (err,rows) {
                if (err) {
                    res.statusCode =500;
                    res.end(err);
                }
                //the we update the list date modif
                list.updateListDate(req.params.idl,function (err,rows) {
                    if (err) {
                        res.statusCode = 500;
                        res.end(err);
                    }
                    res.end();
                })
            })
        })
        .put(tokenChecker.checkToken, function(req,res){
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                    res.statusCode = 400;
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
                        res.statusCode = 500;
                        res.end(err);
                    }
                    //when the gift is created we update the list date modif
                    list.updateListDate(body.FK_idList,function (err,rows) {
                        if (err) {
                            res.statusCode = 500;
                            res.end();
                        }
                        res.end(JSON.stringify(rows));
                    })
                    
                }) 
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });
        
    router.route('/groups')
        .post(tokenChecker.checkToken, function (req, res) {
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                        res.statusCode =500;
                        res.end(JSON.stringify(err));
                    }
                    else{
                        group.belongToCreation(req.id, rows.insertId, function (err1, rows1) {
                            if (err1) {
                                res.statusCode = 500;
                                res.end(JSON.stringify(err1))
                            }
                            res.statusCode=201;
                            res.end(JSON.stringify("Le groupe a été créer avec succès"));
                        })
                    }
                    
                    
                });

            });
        })
        .get(tokenChecker.checkToken, function (req, res) {
            group.getAllUserGroup(req.id, function (err, rows) {
                if(err){
                    res.statusCode =500;
                    res.end(JSON.stringify(err));
                }
                else if (rows) {
                    //Convert query result in JS object
                    rows = JSON.parse(JSON.stringify(rows));
                    //iterate over the rows and reformat the date
                    rows = datetime.format(rows, 'grpCreationDate',false);
                    res.end(JSON.stringify({rows}));
                }
                else{
                    res.end();
                }
            });
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/groups/toshare')
        .get(tokenChecker.checkToken,function (req,res) {
            group.getShareableGrp(req.id,function (err,rows) {
                if (err) {
                    res.statusCode=500;
                    res.end();
                } else {
                    res.end(JSON.stringify(rows));
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/groups/invitation')
        .post(tokenChecker.checkToken,function (req,res) {
            
            let body = [];
            req.on('error', (err) => {
                throw err;
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
                        res.statusCode=500;
                        res.end(JSON.stringify(err));
                    }
                    else{
                        invitation.accept(body.id,body.grpid,req.id, function(err1,rows1) {
                            if (err1) {
                                res.statusCode=500;
                                res.end(JSON.stringify(err1));
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
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/groups/invitation/:idInv')
        .delete(tokenChecker.checkToken,function (req,res) {
            invitation.deleteInvitation(req.params.idInv,function (err,rows) {
                if(err){
                    res.statusCode=500;
                    res.end(JSON.stringify(err));
                }
                else{
                    res.end(JSON.stringify("L'invitation a été supprimée"));
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });
        
    router.route('/groups/:id')
        .get(tokenChecker.checkToken,function(req,res) {
            group.getMembers(req.id,req.params.id, function (err,rows) {
                if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify(err))
                }
                else if(rows){
                    group.getGroupName(req.params.id,function (err1,rows1) {
                        if (err1) {
                            res.statusCode = 500;
                            res.end(JSON.stringify(err1));
                        }
                        else{
                            group.getUserSharedListId(req.id,req.params.id,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode = 500;
                                    res.end(JSON.stringify(err2));
                                } 
                                else {
                                    //merge the rows and rows1 
                                    rows = JSON.parse(JSON.stringify(rows));
                                    rows1 = JSON.parse(JSON.stringify(rows1));
                                    rows2 = JSON.parse(JSON.stringify(rows2));

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
                throw err;
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
                
                user.getUserIdByUsername(body.username,function (err,rows) {
                    if (err) {
                        res.statusCode=500;
                        res.end(JSON.stringify(err));
                    }
                    else{
                        let userid = rows[0].idUser 
                        invitation.checkAlreadyMember(req.params.id, userid, function (err2,rows2) {
                            if (err2) {
                                res.statusCode=500;
                                res.end(err2);
                            }
                            else if (rows2[0].count == 0){
                                invitation.checkAlreadySend(userid,req.params.id,function (err3,rows3) {
                                    if (err3) {
                                        res.statusCode=500;
                                        res.end(JSON.stringify(err3))
                                    }
                                    else if(rows3[0].count == 0){
                                        invitation.invitMember(req.id, userid, req.params.id, function (err1,rows1) {
                                            if (err1) {
                                                res.statusCode=500;
                                                res.end(JSON.stringify(err));
                                            }
                                            else{
                                                res.statusCode=201;
                                                res.end(JSON.stringify("L'invitation a été envoyée à "+ body.username));
                                            }
                                        })
                                    }
                                    else{
                                        res.statusCode=409;
                                        res.end(JSON.stringify("Une invitation a déjà été envoyée à "+body.username))
                                    }
                                })
                            }
                            else{
                                res.statusCode=409;
                                res.end(JSON.stringify(body.username+" est déjà dans le groupe"));
                            }
                        })   
                    }
                    
                })  
            })
        })
        .delete(tokenChecker.checkToken, function(req,res) {
            let idGrp = req.params.id;
            group.getMembers(req.id,idGrp,function (err,rows) {
                if (err) {
                    res.statusCode=500;
                    res.end();
                } 
                else {
                    for (let i = 0; i < rows.length; i++) {
                        let username=rows[i].username;
                        memberRemover.removeGrpMember(username,idGrp,res);
                    }
                    group.getAdminUsername(idGrp,function (err1,rows1) {
                        if (err1) {
                            res.statusCode=500;
                            res.end();
                        }
                        else {
                            memberRemover.removeGrpMember(rows1[0].username,idGrp,res);

                            invitation.deleteAllInvitation(idGrp,function (err2,rows2) {
                                if (err2) {
                                    res.statusCode=500;
                                    res.end();
                                }
                                else {
                                    group.deleteGroup(idGrp,function (err3,rows3) {
                                        if (err3) {
                                            res.statusCode=500;
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
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/groups/admin/:id')
        .get(tokenChecker.checkToken,function (req,res) {
            group.isAdmin(req.id,req.params.id,function (err,rows) {
                if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify(err))
                }
                else{
                    res.statusCode=200;
                    res.end(JSON.stringify(rows[0].grpAdmin))
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });
    
    router.route('/groups/:idg/:username')
        .get(tokenChecker.checkToken,function (req,res) {
            let idGrp = req.params.idg;
            let username = req.params.username;
            list.getListId(idGrp,username,function (err,rows) {
                if (err) {
                    res.statusCode=500;
                    res.end();
                }
                else {
                    res.end(JSON.stringify(rows));
                }
            })
        })
        .delete(tokenChecker.checkToken,function(req,res){
            let idGrp = req.params.idg;
            let username = req.params.username;
            memberRemover.removeGrpMember(username,idGrp,res);
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });

    router.route('/home')
        .get(tokenChecker.checkToken, function (req, res) {
            user.getUserName(req.id,function (err,rows) {
                if (err) {
                    res.statusCode=500;
                    res.end(JSON.stringify(rows))
                }
                else{
                    res.end(JSON.stringify(rows[0].username))
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });
    router.route('/home/invits')
        .get(tokenChecker.checkToken, function (req,res) {
            invitation.getInvitations(req.id,function (err,rows) {
                if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify(err));
                }
                else {
                    rows = JSON.parse(JSON.stringify(rows));
                    rows = datetime.format(rows, 'invitationDate', true);
                    res.end(JSON.stringify(rows));
                }
            })
        })
        .all(function (req, res) {
            res.statusCode = 405 // Method not allowed
            res.end()
        });
    
    const nodeStatic = require('node-static');
    const staticFile = new(nodeStatic.Server)('./public/');

    router.route('*')
    .get(function (req,res) {
        staticFile.serve(req,res);
    })
}   

module.exports.routing = routing;