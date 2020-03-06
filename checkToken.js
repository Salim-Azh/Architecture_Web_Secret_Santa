const jwt = require('jsonwebtoken');

//uuid  use a CSPRNG, and 'transform' the bytes in an unbiased
// Cryptographically Secure Pseudo-Random Number Generator : produce unpredictible values
const { v4: uuidv4 } = require('uuid');

/**
 * @property key is the secret key used to encode and decode the JWT token
 * @constant
 */
const key = uuidv4(); 


/**
 * 
 * @param {IncommingMessage} req is an HTTP request 
 * @param {ServerResponse} res is the corresponding HTTP response
 * @param {*} next the next handler
 * @description  checkToken verify if the token from request headers is valid
 * if yes put req.id if not then return status 401
 * used as a middleware = (function executed before callback function)
 * @public
 */
var checkToken = function (req, res, next) {
    // if authorization header is not present
    if (!req.headers.authorization) {
        res.statusCode = 400; //Bad request
        res.end('invalid_request');
    }
    //else we fetch the token value
    const token = req.headers.authorization.split(' ')[1];
    try {
        var payload = jwt.verify(token, key);
    } catch(err) {
        res.statusCode = 401; // Unauthorized
        res.end('invalid_token');
    }
    req.id = payload.subject;
    next();
}

module.exports.checkToken = checkToken;
exports.key = key;