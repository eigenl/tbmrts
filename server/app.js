/*
	The MIT License (MIT)

	Copyright (c) 2013 Eigen Lenk

	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
	the Software, and to permit persons to whom the Software is furnished to do so,
	subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
	FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
	COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
	IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var WebSocketServer = require('websocket').server;
var HTTP = require('http');
var ServerState = require('serverState');
var Client = require('client');
var DB = require('db');
var Express = require('express');
var AStarFinder = require('AStarFinder');
var config = require("./config.json");
var tickTimer = null;
var tickCount = 0;

var server = HTTP.createServer(function(request, response) {
	console.log("create server");
});

server.listen(config.port, function() { 
	console.log("http server listen port "+config.port);
});

var app = Express();

app.get("/getGameSessions", function(req, res) {
    res.header("Access-Control-Allow-Origin", config.origin);
    var sessions = JSON.stringify(ServerState.getGameSessions());
    res.send(sessions);
});

app.listen(config.httpAppPort);

// Create the server
wsServer = new WebSocketServer({
    httpServer: server
});

DB.init();

function update()
{
	clearTimeout(tickTimer);
	tickTimer = setTimeout(update, 500);
	
	process.nextTick(function()
	{
		ServerState.tick();
    
		if (tickCount & 1)
			ServerState.slowTick();
		
		tickCount++;
	});
	
	return;
}

// WebSocket server
wsServer.on('request', function(request)
{
	/*
		New client connects to the server.
	*/
	
	var client = new Client();
	
	// console.log("REQUEST:");
	// console.log(request);
	
	// console.log("New connection!");
	// console.log("  Remote address: " + request.remoteAddress);
	
	if (request.origin != config.origin) {
		console.log("Bad origin: " + request.origin);
		request.reject(401, 'gtfo');
		return;
	}
	
	client.onConnected(request.accept(null, request.origin));
	
	ServerState.addClient(client);

    client.connection.on('message', function(message)
    {
        if (message.type === 'utf8')
        {
            var object = JSON.parse(message['utf8Data']);

            switch(object.method)
			{
                case 'login':
					ServerState.performLogin(client, object.params);
                    break;
					
                case 'logout':
                    ServerState.performLogout(client);
                    break;
					
                case 'createGameSession':
					process.nextTick(function() {
						ServerState.createGameSession(client, object.params);
					});
                    break;
					
                case 'join':
					process.nextTick(function() {
						ServerState.joinGameSession(client, object.params);
					});
                    break;
					
                case 'leave':
					process.nextTick(function() {
						client.onLeave();
						client.sendMessage({"method": "leave", "result": {"success": true}});
					});
                    break;
					
                case 'createBuilding':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.createBuilding(client, object.params);
						}
					});
                    break;
                case 'createUnit':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.createUnit(client, object.params);
						}
					});
                    break;
                case 'select':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.select(client, object.params);
						}
					});
                    break;
				case 'unselect':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.unselect(client);
						}
					});
                    break;
                case 'cancelOrder':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.cancelSelectedUnitOrders(client);
						}
					});
                	break;
	            case 'say':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.sendChatMessage(client, object.params);
						}
					});
                	break;
                case 'move':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.move(client, object.params);
						}
					});
                    break;
				case 'attack':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.attack(client, object.params);
						}
					});
                    break;
				case 'repair':
					process.nextTick(function() {
						if (client.gameSession)
							client.gameSession.repair(client, object.params);
					});
                    break;
				case 'sell':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.sellBuilding(client, object.params);
						}
					});
                    break;
				case 'upgrade':
					process.nextTick(function() {
						if (client.gameSession) {
							client.gameSession.upgrade(client, object.params);
						}
					});
                    break;
            }
        }
    });

    client.connection.on('close', function(reasonCode, description)
	{
		if (client != null)
		{
			// console.log("Client " + client.id + " disconnects!")
			// console.log("Reason (" + reasonCode + ") " + description);
			
			client.onDisconnected();
			ServerState.removeClient(client);
			client = null;
		}
		else
		{
			// console.log("NULL client disconnects.");
			// console.log("Reason (" + reasonCode + ") " + description);
		}
    });
});

update();