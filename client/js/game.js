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

$(function () { 
	game = {
		
		checkWebsocketSupport: function() {
		  if ("WebSocket" in window) {
			return true;
		  }
		  else {
			return false;
		  }
		},
		
		readConfAndConnect: function()
		{		
			var rawFile = new XMLHttpRequest();
			
			rawFile.open("GET", "conf.json", true);
			
			rawFile.onreadystatechange = function () {
				if (rawFile.readyState === 4) {
					if (rawFile.status === 200 || rawFile.status == 0) {
						game.conf = jQuery.parseJSON(rawFile.responseText);
						game.connect();
					}
				}
			}
			
			rawFile.send(null);
		},
				
		connect: function()
		{
			if (this.checkWebsocketSupport() == false)
			{
				display.print(17, 22, '╔══════════════════════════════════════════╗', {'bg': 4, 'fg': 14});
				display.print(17, 23, '║ Your browser does not support websockets ║', {'bg': 4, 'fg': 14});
				display.print(17, 24, '╚══════════════════════════════════════════╝', {'bg': 4, 'fg': 14});
				
				return;
			}
			
			this.socket = new WebSocket('ws://' + game.conf['ip'] + ':' + game.conf['webSocketPort']);
	
			this.socket.onopen = function ()
			{
				// console.log("socket opened");
				
				display.showPrompt();

				if ($.cookie('session')) {
					game.sendMessage({'method': 'login', 'params': {'session': $.cookie('session')}});
				}
			};
			
			this.socket.onmessage = function(message) {
				var data = jQuery.parseJSON(message.data);
				// console.log(data);
				if (data.method) {
					window['responseHandler'][data.method](data.result);
				}
			};
			
			this.socket.onerror = function (error) {
				// console.log("failed to connect");
				display.print(24, 22, '╔═════════════════════════════╗', {'bg': 4, 'fg': 14});
				display.print(24, 23, '║ Unable to connect to server ║', {'bg': 4, 'fg': 14});
				display.print(24, 24, '╚═════════════════════════════╝', {'bg': 4, 'fg': 14});
			};
			
			this.socket.onclose = function (error) {
				game.displayServerOfflineMessage();
				display.hidePrompt();
			};
		},
		
		displayServerOfflineMessage: function() {
			if (game.reconnect == -1) {
				game.reconnect = 9;
			}
			
			display.print(24, 21, '╔═════════════════════════════╗', {'bg': 4, 'fg': 14});
			display.print(24, 22, '║      Server is offline      ║', {'bg': 4, 'fg': 14});
			if (game.reconnect == -1) {
				display.print(24, 23, '╚═════════════════════════════╝', {'bg': 4, 'fg': 14});
			} else {
				display.print(24, 23, '║                             ║', {'bg': 4, 'fg': 14});
				display.print(24, 24, '║      ' + 'Reconnecting in ' + game.reconnect + '      ║', {'bg': 4, 'fg': 14});
				display.print(24, 25, '╚═════════════════════════════╝', {'bg': 4, 'fg': 14});
				setTimeout('game.decreaseReconnectCounter()', 1000);
			}
		},
		
		decreaseReconnectCounter: function() {
			game.reconnect -= 1;
			if (game.reconnect == 0) {
				views.showLandingPage();
				game.reconnect = -1;
				game.connect();
			} else {
				game.displayServerOfflineMessage();
			}
		},
		
		processInput: function(inputText)
		{
			if (inputText.length == 0) {
				return;	
			}
			
			// console.log('game.processInput("' + display.promptInput + '")');
			
			display.inputHistory.unshift(inputText);
			
			if (display.inputHistory.length > 10) {
				display.inputHistory.slice(0, 10);
			}
			
			display.inputHistoryIndex = 0;
			
			var components = inputText.split(' ');
			
			if ((components[0] == 'set' || components[0] == 'change') && (components[1] == 'wallpaper' || components[1] == 'background')) {
				if (components.length < 3) {
					log.insert("Please include wallpaper index (1 .. 5)", 12);
				} else {
					game.setWallpaper(parseInt(components[2], 10));
				}
				return;
			}
			
			if (game.started == false)
			{
				if (components[0] == 'begin' ||
				components[0] == 'start' ||
				components[0] == 'launch' ||
				components[0] == 'commence' ||
				components[0] == 'go' ||
				components[0] == 'begin')
				{
					game.started = true;
					game.readConfAndConnect();
					views.showLandingPage();
				}	
			
				return;
			}
	
			if (components[0] == 'help') {
				if (components.length == 1) {
					game.displayHelp(0, '');
				} else {
					game.displayHelp(0, inputFromParameter(components, 1).toLowerCase());
				}
				return;
			}
			else if (components[0] == 'more') {
				if (views.showMore > 0) { game.displayHelp(views.showMore, ''); }
				return;
			}
			else if (inputText == 'clear log' || inputText == 'clear') {
				log.clear();
				return;
			}
			else if (components[0] == 'login') {
				if (client.authenticated) {
					log.insert("Already logged in.", 4);
				} else {
					if (components.length < 3) {
						display.print(0, 27, "Please enter both username and password..", {'fg': 12});
					} else {
						game.sendMessage({'method': 'login', 'params': {'user': components[1], 'pass': components[2]}});
					}		
				}
				return;				
			} else if (components[0] == 'logout') {
				if (client.authenticated) {
					game.setInGame(false);
					game.sendMessage({'method': 'logout'});
					$.removeCookie('session');
					client.authenticated = false;
					log.clear();
					views.showLandingPage();
				} else {
					display.print(0, 25, "Already logged out.");
				}
				return;
			}
			
			// In lobby
			if (views.current == 2)
			{
				if (inputText == 'lobby') {
					views.displayMainMenu(0);
					return;
				} else if (inputText == 'new game') {
					views.displayMainMenu(1);
					return;
				} else if (components[0] == 'say') {
					log.insert("Chat is only available in-game.", 12);
					return;
				} else if (components[0] == 'refresh' || components[0] == 'reload') {
					requests.getGameSessions();
					return;
				} else if (components[0] == 'next') {
					lobby.nextPage();
					return;
				} else if (components[0] == 'prev') {
					lobby.prevPage();
					return;
				} else if (components[0] == 'set') {
					// New game
					if (views.lobby.segment == 1) {
						if (components[1] == 'name') {
							views.lobby.name = inputFromParameter(components, 2).toUpperCase(); // input string after "set name"
							views.displayMainMenu(1);
						} else if (components[1] == 'players') {
							var num = parseInt(components[2], 10);
							if (num < 2 || num > 8) {
								log.insert('Keep the player count between 2 and 8', 12);
							} else {
								views.lobby.players = num;
								views.displayMainMenu(1);
							}
						} else if (components[1] == 'pass' || components[1] == 'password') {
							if (components.length > 2) {
								views.lobby.password = components[2].toUpperCase();
							} else {
								views.lobby.password = '';
							}
							views.displayMainMenu(1);
						}
					}
					return;
				} else if (components[0] == 'create' && views.lobby.segment == 1) {
					console.log('send new game session request');
					game.sendMessage({'method': 'createGameSession', 'params': {'name': views.lobby.name, 'players': views.lobby.players, 'password': views.lobby.password}});
					return;
				} else if (components[0] == 'join' && views.lobby.segment == 0) {
					var idx = parseInt(components[1], 10) - 1;
					var pass = (components.length > 2 ? components[2].toUpperCase() : '');
					if (idx < lobby.gameSessions.length) {
						var ses = lobby.gameSessions[idx];
						game.sendMessage({'method': 'join', 'params': {'gameSession': ses.id, 'password': pass}});
					}
					return;
				}
			}
			// In game
			else if (views.current == 3)
			{
				if (inputText == 'map') {
					views.displayGame(0);
					return;
				}
				else if (components[0] == 'say') {
					var chatText = inputFromToParameter(components, 1, components.length);
					log.insert('You say: '+chatText.toUpperCase(), 14);
					game.sendMessage({'method': 'say', 'params': {'text': chatText}});
					return;
				}
				else if (inputText == 'units') {
					views.displayGame(1);
					return;
				}
				else if (inputText == 'base') {
					views.displayGame(2);
					return;
				}
				else if (inputText == 'info') {
					views.displayGame(3);
					return;
				}
				else if (components[0] == 'next') {
					if (views.inGame.segment == 1) { views.nextUnitPage(); }
					else if (views.inGame.segment == 2) { views.nextBasePage(); }
					return;
				} else if (components[0] == 'prev') {
					if (views.inGame.segment == 1) { views.prevUnitPage(); }
					else if (views.inGame.segment == 2) { views.prevBasePage(); }
					return;
				} else if (inputText == 'unselect' || inputText == 'clear selection') {
					map.selectionType = 'none';
					map.selectionIndex = -1;
					map.display();
					views.updateSelectionSidebar();
					game.sendMessage({'method': 'unselect'});
					return;
				} else if (components[0] == 'home') {
					map.centerOnHomeBase();
					return;
				} else if (inputText.indexOf('cancel order') != -1 || inputText == 'stop' || inputText == 'cancel') {
					game.sendMessage({'method': 'cancelOrder'});
					return;
				}
				else if (components[0] == 'train')
				{
					if (game.currentGameSessionActive == false) {
						return;
					}
					
					if (map.selectionType == 'building' && map.buildings[map.selectionOwner][map.selectionIndex].type == 2)
					{
						var unitName = inputFromToParameter(components, 1, components.length);
						var b = map.buildings[map.selectionOwner][map.selectionIndex];
						
						if  (b && b.time != 0)
						{
							log.insert("BARRACKS is under construction.", 12);
							return;
						}
						
						console.log('train ' + unitName + ' in BARRACKS at ' + b.x + ' ' + b.y);
						
						var uType = unitTypeFromName(unitName);
						var trainingOptions = client.getTrainingOptions();
						
						if ($.inArray(uType, trainingOptions) < 0) {
							log.insert("Unit type not available.", 12);
							return;
						}
						
						if (uType != -1) {
							game.sendMessage({'method': 'createUnit', 'params': {'x': b.spawnpoint.x, 'y': b.spawnpoint.y, 'type': uType}});
						}
						else {
							log.insert("Unknown unit type..", 12);
						}
					}
					else {
						log.insert("Select BARRACKS to train units..", 12);
					}
					return;
				}
				else if (components[0] == 'build' || components[0] == 'create' || components[0] == 'construct')
				{
					if (game.currentGameSessionActive == false) {
						return;
					}
					
					if (map.selectionType == 'building' && map.buildings[map.selectionOwner][map.selectionIndex].type == 3)
					{
						var unitName = inputFromToParameter(components, 1, components.length);
						var b = map.buildings[map.selectionOwner][map.selectionIndex];
						console.log('build ' + unitName + ' in FACTORY at ' + b.x + ' ' + b.y);
						
						var uType = unitTypeFromName(unitName);
						var unitBuildOptions = client.getFactoryBuildOptions();
						
						if ($.inArray(uType, unitBuildOptions) < 0) {
							log.insert("Unit type not available.", 12);
							return;
						}
						
						if (uType != -1) {
							game.sendMessage({'method': 'createUnit', 'params': {'x': b.spawnpoint.x, 'y': b.spawnpoint.y, 'type': uType}});
						}
						else {
							log.insert("Unknown unit type..", 12);
						}
						return;
					}
					else if (map.selectionType == 'building' && map.buildings[map.selectionOwner][map.selectionIndex].type == 0)
					{
						var buildingName = inputFromToParameter(components, 1, components.length-1);
						var coords = coordsFromString(components[components.length-1]);
					
						// console.log(components.length);
					
						if (components.length < 3 || (coords.x < 0 || isNaN(coords.y))) {
							log.insert("Specify building type and coordinates.", 12);
						}
						else
						{
							if (map.buildingForCoords(-1, coords.x, coords.y) == null && map.isSpawnpoint(coords.x, coords.y) == false)
							{
								if (coords.x < 0 || coords.y < 0 || coords.x >= map.width || coords.y >= map.height) {
									log.insert("Specify valid coordinate for new building.", 12);
								} else {
									if (map.isDiscovered(coords.x, coords.y) == false) {
										log.insert("Area undiscovered.", 12);
										return;
									}
									
									var bType = buildingTypeFromName(buildingName);
									if (bType != -1)
									{
										var availableConstructionOptions = client.getConstructionOptions();
										var availableToBuild = false;
										
										for (var j=0; j < availableConstructionOptions.length; ++j) {
											if (availableConstructionOptions[j] == bType) {
												availableToBuild = true;
												break;
											}
										}
										
										if (availableToBuild) {
											game.sendMessage({'method': 'createBuilding', params: {'type': bType, 'x': coords.x, 'y': coords.y}});
										} else {
											log.insert("This construction option is not available.", 12);
										}
									} else {
										log.insert("Unknown building type..", 12);
									}
								}
							}
							else {
								log.insert("Map piece occupied!", 12);
							}
						}
					}
					else {
						log.insert("Select COMMAND CENTER to build..", 12);
					}
					return;
				}
				else if (components[0] == 'center')
				{
					if (game.currentGameSessionActive == false) { return; }
					
					if (components.length == 1)
					{
						if (map.selectedCoords.x < 0 || map.selectedCoords.y < 0) {
							log.insert("Missing coordinate to center the map on.", 12);		
						} else {
							map.centerOn(map.selectedCoords.x, map.selectedCoords.y);
							map.display();
						}
					}
					else
					{
						var coords = coordsFromString(components[1]);
						if (coords.x < 0 || coords.x >= map.width || coords.y < 0 || coords.y >= map.height) {
							log.insert("Invalid coordinate!", 12);
							return;	
						}
						map.centerOn(coords.x, coords.y);
						map.display();
					}
					return;
				}
				else if (components[0] == 'sell' || components[0] == 'decommission')
				{
					if (game.currentGameSessionActive == false) { return; }
					
					if (components.length == 1) {
						log.insert("Missing building coordinates.", 12);
					}
					else {
						if (map.selectionType == 'building' && map.buildings[map.selectionOwner][map.selectionIndex].type == 0)
						{
							var coords = coordsFromString(components[1]);
							if (coords.x < 0 || coords.x >= map.width || coords.y < 0 || coords.y >= map.height) {
								log.insert("Invalid coordinate!", 12);
								return;	
							}
							var bToSell = map.buildingForCoords(client.index, coords.x, coords.y);
							if (!bToSell) {
								log.insert("No building at coordinate " + components[1].toUpperCase() + "..", 12);	
							} else {
								if (bToSell.type == 0) {
									log.insert("You cannot sell the COMMAND CENTER.", 12);
								} else {
									game.sendMessage({'method': 'sell', 'params': {'x': coords.x, 'y': coords.y}});
								}
							}
						} else {
							log.insert("Select COMMAND CENTER to sell base buildings..", 12);
						}
					}
					return;
				}
				else if (components[0] == 'select' || components[0] == 'sel')
				{
					if (game.currentGameSessionActive == false) {
						return;
					}
					
					if (map.selectionIndex != -1) {
						var coords = map.selectionIndexToCoords();
						if ((components[1] == 'left' || components[1] == 'west') && coords.x > 0) {
							game.selectTile(coords.x-1, coords.y, -1);
						} else if ((components[1] == 'right' || components[1] == 'east') && coords.x < map.width - 1) {
							game.selectTile(coords.x+1, coords.y, -1);
						} else if ((components[1] == 'down' || components[1] == 'south') && coords.y < map.height - 1) {
							game.selectTile(coords.x, coords.y+1, -1);
						} else if ((components[1] == 'up' || components[1] == 'north') && coords.y > 0) {
							game.selectTile(coords.x, coords.y-1, -1);
						}
					}
					
					if (components.length == 1) {
						log.insert("Specify coordinates to select", 12);
						return;	
					}
					
					var coords = coordsFromString(components[1]);
						
					if (coords.x != -1 && coords.y >= 0 && coords.y < map.height && coords.x < map.width)
					{
						if (map.isDiscovered(coords.x, coords.y) == false) {
							log.insert("Area undiscovered.", 12);
							return;	
						}
						
						var indexToSelect = -1;
						
						if (components.length > 2)
						{
							indexToSelect = parseInt(components[2], 10) - 1;
							
							if (indexToSelect < 0 || indexToSelect >= 10) {
								indexToSelect = -1;
							}
						}
						
						map.centerOn(coords.x, coords.y);
						game.selectTile(coords.x, coords.y, indexToSelect);
						views.updateSelectionSidebar();
						
						if (map.selectionType == 'unit') {
							game.sendMessage({'method': 'select', 'params': {'x':coords.x, 'y':coords.y, 'index':indexToSelect}});
						} else {
							game.sendMessage({'method': 'unselect'});
						}
					}
					else
					{
						log.insert("Invalid coordinate!", 12);
					}
					
					return;
				}
				else if (inputText.indexOf('attack') != -1)
				{
					if (game.currentGameSessionActive == false)
						return;
					
					if (map.selectionType != 'unit') {
						log.insert("No unit selected.", 12);
						return;	
					}

					coords = coordsFromString(components[components.length-1]);
					
					if (coords.x < 0 || coords.x >= map.width || coords.y < 0 || coords.y >= map.height) {
						log.insert("Invalid coordinate!", 12);
						return;	
					}
					
					game.sendMessage({'method': 'attack', 'params': {'x': coords.x, 'y': coords.y}});
					
					game.displayUnitReply();
					
					return;
				}
				else if (inputText.indexOf('repair') != -1)
				{
					if (game.currentGameSessionActive == false)
						return;
					
					if (map.selectionType != 'unit') {
						log.insert("No unit selected.", 12);
						return;	
					}

					coords = coordsFromString(components[components.length-1]);
					
					if (coords.x < 0 || coords.x >= map.width || coords.y < 0 || coords.y >= map.height) {
						log.insert("Invalid coordinate!", 12);
						return;	
					}
					
					// Only keep engineers selected
					game.filterSelectedUnitsByType(6);
					
					game.sendMessage({'method': 'repair', 'params': {'x': coords.x, 'y': coords.y}});
					
					game.displayUnitReply();
					
					return;
				}
				else if (components[0] == 'upgrade')
				{
					if (game.currentGameSessionActive == false) { return; }
					
					if (map.selectionType == 'building' && map.buildings[map.selectionOwner][map.selectionIndex].type == 4)
					{
						var buildingName = inputFromToParameter(components, 1, components.length);
						var bType = buildingTypeFromName(buildingName);
						
						console.log('bType = ' + bType);
						
						if (bType == -1) {
							log.insert('Unknown building type..', 13);
						} else {
							var b = map.getBuildingByType(client.index, bType);
							if (b) {
								game.sendMessage({'method': 'upgrade', params: {'upgradeType': 'building', 'type': b.type}});
							} else {
								log.insert('No such building in base..', 13);
							}
						}
					}
					
					return;
				}
				else if (inputText.indexOf('move') != -1 || inputText.indexOf('go') != -1 || inputText.indexOf('mov') != -1)
				{
					if (game.currentGameSessionActive == false) { return; }
					
					if (map.selectionType != 'unit') {
						log.insert("No unit selected.", 12);
						return;	
					}
					
					if (components.length >= 2)
					{
						var relativeMovement = false;
						var coords = null;
						var dir = components[components.length-1];
									
						console.log('dir = ' + dir);
						
						if (dir == 'n' || inputText.indexOf('north') != -1 || inputText.indexOf('up') != -1) {
							relativeMovement = true; coords = {'x': 0, 'y': -1};
						}else if (dir == 'nw' || inputText.indexOf('north west') != -1 || inputText.indexOf('up left') != -1) {
							relativeMovement = true; coords = {'x': -1, 'y': -1};
						} else if (dir == 'w' || inputText.indexOf('west') != -1 || inputText.indexOf('left') != -1) {
							relativeMovement = true; coords = {'x': -1, 'y': 0};
						} else if (dir == 'sw' || inputText.indexOf('south west') != -1 || inputText.indexOf('down left') != -1) {
							relativeMovement = true; coords = {'x': -1, 'y': 1};
						} else if (dir == 's' || inputText.indexOf('south') != -1 || inputText.indexOf('down') != -1) {
							relativeMovement = true; coords = {'x': 0, 'y': 1};
						} else if (dir == 'se' || inputText.indexOf('south east') != -1 || inputText.indexOf('down right') != -1) {
							relativeMovement = true; coords = {'x': 1, 'y': 1};
						} else if (dir == 'e' || inputText.indexOf('east') != -1 || inputText.indexOf('right') != -1) {
							relativeMovement = true; coords = {'x': 1, 'y': 0};
						} else if (dir == 'ne' || inputText.indexOf('north east') != -1 || inputText.indexOf('up right') != -1) {
							relativeMovement = true; coords = {'x': 1, 'y': -1};
						}
	
						if (relativeMovement == false) {
							coords = coordsFromString(components[components.length-1]);
							if (coords.x < 0 || coords.x >= map.width || coords.y < 0 || coords.y >= map.height) {
								log.insert("Invalid coordinate!", 12);
								return;	
							}
							if (map.isDiscovered(coords.x, coords.y) == false) {
								log.insert("Area undiscovered.", 12);
								return;	
							}
						}
						
	
						game.sendMessage({'method': 'move', 'params': {'relative': relativeMovement, 'x': coords.x, 'y': coords.y}});
						
						game.displayUnitReply();
					}
					return;
				}
				else if (components[0] == 'leave' && game.currentGameSessionId != null) {
					game.sendMessage({'method': 'leave'});
					game.setInGame(false);
					return;
				}
				else if (views.inGame.segment == 0)
				{
					var step = (components.length == 1 ? 1 : parseInt(components[1], 10));
					
					if (isNaN(step)) { step = 1; }
					
					if (components[0] == 'left' || components[0] == 'west') {
						map.offsetX = Math.max(map.offsetX-step, 0);
						map.display();
						return;
					} else if (components[0] == 'right' || components[0] == 'east') {
						map.offsetX = Math.min(map.offsetX+step, map.width - 19);
						map.display();
						return;
					} else if (components[0] == 'up' || components[0] == 'north') {
						map.offsetY = Math.max(map.offsetY-step, 0);
						map.display();
						return;
					} else if (components[0] == 'down' || components[0] == 'south') {
						map.offsetY = Math.min(map.offsetY+step, map.height - 14);
						map.display();
						return;
					}
				}
			}
			else if (views.current == 4)
			{
				if (components[0] == 'continue') {
					log.visible = true;
					game.setInGame(false);
					return;
				}
			}
			
			log.insert('Unknown command: ' + inputText.toUpperCase(), 12);
		},
		
		filterSelectedUnitsByType: function(filteredUnitType)
		{
			for (var u = 0; u < map.units[client.index].length; ++u) {
				if (map.units[client.index][u].selected == true && map.units[client.index][u].type != filteredUnitType) {
					map.units[client.index][u].selected = false;
				}
			}
			map.display();
			views.updateSelectionSidebar();
		},
		
		displayUnitReply: function() {
			var n = Math.floor((Math.random()*4));
			if (n == 0) {
				log.insert('"Yes, sir!"', 9);
			} else if (n == 1) {
				log.insert('"Roger that."', 9);
			} else if (n == 2) {
				log.insert('"Consider it done."', 9);
			} else if (n == 3) {
				log.insert('"I\'m on it!"', 9);
			}		
		},
		
		setInGame: function(in_game, params)
		{
			if (in_game == true)
			{
				display.inputHistory = [];
				display.inputHistoryIndex = 0;
				game.currentGameSessionId = params.gameSession;
				game.currentGameSessionName = params.sessionName;
				log.clear();
				views.displayGame(0);
				log.insert("Type 'HELP' to learn how to get started.");
			}
			else
			{
				game.currentGameSessionId = null;
				log.clear();
				views.displayMainMenu(0);
				requests.getGameSessions();
			}
		},
		
		sendMessage: function(message) {
			this.socket.send(JSON.stringify(message));
		},
		
		selectTile: function(x, y, indexToSelect)
		{
			map.selectionType = 'none';

			// Firstly unselect all units
			for (var i=0; i < game.maxPlayers; i++) {			
				$.each(map.units[i], function(ui, u) {
					u.selected = false;
				});
			}

			var selectedCounter = 0;
			var indexCounter = 0;
						
			// Start by selecting your units
			$.each(map.units[client.index], function(ui, u)
			{
				if (u.x == x && u.y == y)
				{
					if (indexToSelect < 0)
					{
						if (selectedCounter < 10)
						{
							map.selectionType = 'unit';
							map.selectionIndex = ui;
							map.selectionOwner = client.index;
							u.selected = true;
							selectedCounter ++;
						}
					}
					else
					{
						if (indexToSelect == indexCounter)
						{
							map.selectionType = 'unit';
							map.selectionIndex = ui;
							map.selectionOwner = client.index;
							u.selected = true;
							selectedCounter ++;
							return false;
						}
						
						indexCounter ++;
					}
				}
			});
			
			
			for (var i=0; i < game.maxPlayers; i++)
			{
				if (!map.buildings[i]) {
					continue;	
				}
				
				for (var bi=0; bi<map.buildings[i].length; bi++)
				{
					var b = map.buildings[i][bi];
					
					if (b.x == x && b.y == y)
					{
						map.selectionType = 'building';
						map.selectionIndex = bi;
						map.selectionOwner = i;
						map.display();
						views.updateSelectionSidebar();
						
						return;
					}
				}

				// If none selected move onto other players
				if (selectedCounter == 0)
				{
					$.each(map.units[i], function(ui, u)
					{
						if (u.x == x && u.y == y /*&& (map.selectionOwner < 0 || map.selectionOwner == i)*/)
						{
							if (selectedCounter < 10)
							{
								map.selectionType = 'unit';
								map.selectionIndex = ui;
								map.selectionOwner = i;
								
								u.selected = true;
								
								selectedCounter ++;
							}
							else
							{
								u.selected = false;
							}
						}
						else
						{
							u.selected = false;
						}
					});
				}
			}


			
			if (map.selectionType == 'unit')
			{
				map.display();
				views.updateSelectionSidebar();
				return;
			}
		
			map.selectionType = 'tile';
			map.selectionOwner = -1;
			map.selectionIndex = (y * map.width) + x;
			
			map.display();
			views.updateSelectionSidebar();
		},
		
		displayHelp: function(page, subject)
		{
			log.clear();
			
			if (subject == 'units')
			{
				log.insert("Read more about different units: SCOUT, TROOPER, HEAVY TROOPER, FIELD MEDIC,", 9);
				log.insert("ENGINEER, LIGHT TANK, HEAVY TANK & MRB.", 9);
				log.insert(" ", 9);
				log.insert("Just type 'HELP <unit name>'.", 9);
				return;
			}
			else if (subject == 'buildings' || subject == 'base')
			{
				log.insert("Read more about different buildings: COMMAND CENTER, POWER PLANT, SUPPLY", 9);
				log.insert("DEPOT, BARRACKS, FACTORY, LAB, TURRET, GARAGE & FIELD HOSPITAL.", 9);
				log.insert(" ", 9);
				log.insert("Just type 'HELP <building name>'.", 9);
				return;
			}
			else if (subject == 'scout')
			{
				log.insert("SCOUT", 14);
				log.insert(" ", 0);
				log.insert("Scouts are unarmed infantry units used for exploration.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 15", 3);
				log.insert("   Speed: Fast", 3);
				return;
			}
			else if (subject == 'trooper')
			{
				log.insert("TROOPER", 14);
				log.insert(" ", 0);
				log.insert("Troopers are the basic lightly armoured and equipped infantry units.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 20", 3);
				log.insert("   Speed: Normal", 3);
				return;
			}
			else if (subject == 'heavy trooper')
			{
				log.insert("HEAVY TROOPER", 14);
				log.insert(" ", 0);
				log.insert("Heavy troopers have stronger armor and more powerful weaponry.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 40", 3);
				log.insert("   Speed: Normal", 3);
				return;
			}
			else if (subject == 'field medic')
			{
				log.insert("FIELD MEDIC", 14);
				log.insert(" ", 0);
				log.insert("Field medics can heal wounded units back to 50% health. Just include", 15);
				log.insert("them in the group along with other units and they will do their thing.", 15);
				log.insert(" ", 0);
				log.insert("Strength: 30", 3);
				log.insert("   Speed: Normal", 3);
				return;
			}
			else if (subject == 'engineer')
			{
				log.insert("ENGINEER", 14);
				log.insert(" ", 0);
				log.insert("Engineers are able to fix up battered vehicles up to 50% condition. Include", 15);
				log.insert("them in the group along with other units and they will do their thing.", 15);
				log.insert(" ", 0);
				log.insert("Strength: 30", 3);
				log.insert("   Speed: Normal", 3);
				return;
			}
			else if (subject == 'light tank')
			{
				log.insert("LIGHT TANK", 14);
				log.insert(" ", 0);
				log.insert("Light tanks have thin armor and only the basic offence capabilities.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 150", 3);
				log.insert("   Speed: Normal", 3);
				return;
			}
			else if (subject == 'heavy tank')
			{
				log.insert("HEAVY TANK", 14);
				log.insert(" ", 0);
				log.insert("Heavy tanks have thick armor and good offence capabilities but they cost", 15);
				log.insert("more.", 15);
				log.insert(" ", 0);
				log.insert("Strength: 250", 3);
				log.insert("   Speed: Normal", 3);
				return;
			}
			else if (subject == 'mrb')
			{
				log.insert("MOBILE RADAR BEACON", 14);
				log.insert(" ", 0);
				log.insert("MRB's are useful for keeping a large area of the map visible. They are very", 15);
				log.insert("slow and fragile so better keep defencive units around.", 15);
				log.insert(" ", 0);
				log.insert("Strength: 150", 3);
				log.insert("   Speed: Slow", 3);
				return;
			}
			else if (subject == 'command center')
			{
				log.insert("COMMAND CENTER", 14);
				log.insert(" ", 0);
				log.insert("Command centers are the integral part of any base. It's were supplies are", 15);
				log.insert("dropped and where you can construct new and sell existing buildings. Upgrade", 15);
				log.insert("the building to decrease supply drop interval by 20%.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 600", 3);
				return;
			}
			else if (subject == 'barracks')
			{
				log.insert("BARRACKS", 14);
				log.insert(" ", 0);
				log.insert("Barracks are used to train infantry. Upgrade the building to decrease", 15);
				log.insert("training time. Construction option unlocked by building a power plant.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 250", 3);
				return;
			}
			else if (subject == 'factory')
			{
				log.insert("FACTORY", 14);
				log.insert(" ", 0);
				log.insert("Factories are used to building vehicles. Upgrade the building to decrease", 15);
				log.insert("construction time. Need power plant and supply depot to construct.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 400", 3);
				return;
			}
			else if (subject == 'power plant')
			{
				log.insert("POWER PLANT", 14);
				log.insert(" ", 0);
				log.insert("Power plants provide the base with electricity.", 15);
				log.insert(" ", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 300", 3);
				return;
			}
			else if (subject == 'lab')
			{
				log.insert("LABORATORY", 14);
				log.insert(" ", 0);
				log.insert("You can use labs to upgrade different buildings to access new units and", 15);
				log.insert("techology.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 300", 3);
				return;
			}
			else if (subject == 'supply depot')
			{
				log.insert("SUPPLY DEPOT", 14);
				log.insert(" ", 0);
				log.insert("Building supply depots increases the amount of supplies received each drop.", 15);
				log.insert("Upgrade the building to increase drop amount even further.", 15);
				log.insert(" ", 0);
				log.insert(" ", 0);
				log.insert("Strength: 300", 3);
				return;
			}
			else if (subject == 'turret')
			{
				log.insert("TURRET", 14);
				log.insert(" ", 0);
				log.insert("Turrets are the basic defence constructions firing at any nearby enemy unit.", 15);
				log.insert("Upgrade to increase turret damage by 50%.", 15);
				log.insert(" ", 15);
				log.insert(" ", 0);
				log.insert("Strength: 100", 3);
				return;
			}
			else if (subject == 'garage')
			{
				log.insert("GARAGE", 14);
				log.insert(" ", 0);
				log.insert("Garages fix up battered vehicular units placed next to it.", 15);
				log.insert(" ", 15);
				log.insert(" ", 15);
				log.insert(" ", 0);
				log.insert("Strength: 200", 3);
				return;
			}
			else if (subject == 'field hospital' || subject == 'hospital')
			{
				log.insert("FIELD HOSPITAL", 14);
				log.insert(" ", 0);
				log.insert("Field hospitals heal infantry units placed next to it.", 15);
				log.insert(" ", 15);
				log.insert(" ", 15);
				log.insert(" ", 0);
				log.insert("Strength: 150", 3);
				return;
			}
			
			// Lobby
			if (views.current == 2)
			{
				log.insert("You can either join an existing game or start a new one. To join, go to", 9);
				log.insert("lobby by typing 'LOBBY' and type 'JOIN <number> <password>' where number is", 9);
				log.insert("the index of the desired game. Password is only required for locked rooms.", 9);
				log.insert("When there are more games you can move between listing pages by typing 'PREV'", 9);
				log.insert("and 'NEXT'. You can also 'REFRESH' the list.", 9);
				log.insert(" ");
				log.insert("To create a new game type 'NEW GAME'.", 9);
			}
			// In-game
			else if (views.current == 3)
			{
				if (page == 0)
				{
					log.insert("Select tiles by typing 'SELECT <coord>' where coordinate is 'G17' eg. To", 9);
					log.insert("move or attack type 'MOVE ..', 'ATTACK <coord>' respectively. To construct", 9);
					log.insert("buildings select the COMMAND CENTER (C) and type 'BUILD <name> <coord>'", 9);
					log.insert("Available construction options are listed on the right.", 9);
					log.insert(" ", 9);
					log.insert("Training units in the BARRACKS (B) and building vehicles in the FACTORY (F)", 9);
					log.insert("is accomplished by using 'TRAIN <unit>' and 'BUILD <unit>' commands.", 9);
					
					views.showMore = 1;
				}
				else if (page == 1)
				{
					log.insert("You can scroll the map by typing '<dir> <amount>' where direction is either", 9);
					log.insert("LEFT, RIGHT, UP or DOWN. The amount is optional and defaults to 1.", 9);
					log.insert(" ", 9);
					log.insert("Resources are automatically dropped at a certain interval. Use the LAB (L) ", 9);
					log.insert("to upgrade the BARRACKS and FACTORY to access new units.", 9);
					log.insert(" ", 9);
					log.insert("Use 'SAY <message>' to chat.", 9);
					
					views.showMore = 2;
				}
				else if (page == 2)
				{
					log.insert("Build SUPPLY DEPOS (D) to increase the supply drops and upgrade the COMMAND", 9);
					log.insert("CENTER to decrease drop interval.", 9);
					log.insert(" ", 9);
					log.insert("To heal infantry build a FIELD HOSPITAL (H) and move units right next to the", 9);
					log.insert("building. To repair vehicles build a GARAGE (G) and move units next to it.", 9);
					log.insert(" ", 9);
					log.insert("Use 'HOME' to quickly center the map on the home base.", 9);
					
					views.showMore = 3;
				}
				else if (page == 3)
				{
					log.insert("You can sell buildings by typing 'SELL <coord>'. Selling a buildings returns", 9);
					log.insert("75% of the initial cost of supplies.", 9);
					log.insert(" ", 9);
					log.insert("You can get more help on specific subjects (units, buildings) by typing", 9);
					log.insert("'HELP <subject>'.", 9);
					log.insert(" ", 9);
					log.insert("Change the background by typing 'SET WALLPAPER <1 .. 5>'.", 9);
					
					views.showMore = 0;
				}
				
				views.displayGame(views.inGame.segment);
			}
		},
		
		setWallpaper: function(wallpaperIndex) {
			if (wallpaperIndex < 1 || wallpaperIndex > 5) { return; }
			$.cookie('wallpaper', wallpaperIndex, {'expires': 365});
			if (wallpaperIndex == 1) { $('body').css("background-image", "url('wallpapers/wallpaper_lowcolors.jpg')"); }
			else if (wallpaperIndex == 2) { $('body').css("background-image", "url('wallpapers/wallpaper2.jpg')"); }
			else if (wallpaperIndex == 3) { $('body').css("background-image", "url('wallpapers/wallpaper3.jpg')"); }
			else if (wallpaperIndex == 4) { $('body').css("background-image", "url('wallpapers/wallpaper4.jpg')"); }
			else if (wallpaperIndex == 5) { $('body').css("background-image", "url('wallpapers/wallpaper5.jpg')"); }
		},
		
		currentGameSessionId: null,
		currentGameSessionName: null,
		currentGameSessionActive: false,
		clientsInGame: null,
		socket: null,
		buildingDefs: [],
		unitDefs: [],
		barracksQueueLength: 0,
		factoryQueueLength: 0,
		maxPlayers: 0,
		defeated: false,
		power: null,
		reconnect: -1,
		conf: null,
		started: false
	}
});