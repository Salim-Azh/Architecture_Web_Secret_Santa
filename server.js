const http = require('http');
const finalhandler = require('finalhandler');
const Router = require('router');
const api = require('./api');

var router = new Router();
const PORT = process.env.PORT || 8081;
console.log(PORT);
http.createServer(function onRequest(request, response) {
    // Cross Origin Ressource Sharing headers
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PUT');
	response.setHeader('Access-Control-Allow-Headers', '*');
	response.setHeader('Content-Type', 'application/json');
	
	//For browser request
    if (request.method === 'OPTIONS') {
		response.writeHead(200);
		response.end();
		return;
    } 
    
    router(request, response, finalhandler(request, response));

}).listen( PORT);

api.routing(router);