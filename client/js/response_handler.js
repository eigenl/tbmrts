$(function () {
	responseHandler = {
	
		login: function(result)
		{
			if (result.authenticated == false)
			{
				if (result.error == 'wrong_pass') {
					display.print(0, 27, "Wrong password!", {'fg': 12});
				} else if(result.error == 'no_session') {
					$.removeCookie('session');
					log.clear();
					views.showLandingPage();
				}
				
				client.authenticated = false;
			}
			else
			{
				log.clear();
				client.authenticated = true;
				if (result.session) { $.cookie('session', result.session, {'expires': 365}); }
				requests.getGameSessions();
				views.displayMainMenu(0);
				log.insert("Type 'HELP' to learn how to get started.");
			}
		},
		
		createGameSession: function(result) {
			this.handleJoin(result);
		},
		
		join: function(result) {
			this.handleJoin(result);
		},
		
		leave: function(result) {
		
		},
		
		
		
		trainingStarted: function(result)
		{
			if (result.clientIndex == client.index)
			{
				if (result.unit.type == 2 || result.unit.type == 3 || result.unit.type == 7)
				{
					log.insert('Construction started on ' + unitNameForType(result.unit.type) + '..', 9);
					game.factoryQueueLength = result.queue;
				}
				else
				{
					log.insert(unitNameForType(result.unit.type) + ' in training..', 9);
					game.barracksQueueLength = result.queue;
				}
				
				client.resources = result.resources;
				views.updateStatusBar();
				views.updateSelectionSidebar();
			}
		},
		
		trainingCompleted: function(result)
		{
			// console.log(result);
			
			if (result.clientIndex == client.index)
			{
				if (result.unit.type == 2 || result.unit.type == 3 || result.unit.type == 7) {
					log.insert(unitNameForType(result.unit.type) + ' constructed!', 10);
					if (game.factoryQueueLength > 0) {
						game.factoryQueueLength -= 1;
					}
				} else {
					log.insert(unitNameForType(result.unit.type) + ' trained!', 10);
					if (game.barracksQueueLength > 0) {
						game.barracksQueueLength -= 1;
					}
				}
			}
			
			result.unit.selected = false;
			
			map.units[result.clientIndex].push(result.unit);

			map.display();
			views.listUnits();
			views.updateSelectionSidebar();
			
			if (result.clientIndex == client.index) {
				map.calculateVisibleAreas();
			}
		},
		
		trainingFailed: function(result)
		{
			if (result.error == 0) {
				log.insert("Not enough resources.", 12);
			}
		},
		
		
		
		
		
		
		
		constructionStarted: function(result)
		{
			map.buildings[result.clientIndex].push(result.building);
			
			if (result.clientIndex == client.index)
			{
				log.insert(buildingNameForType(result.building.type) + ' started..', 9);
				
				client.resources = result.resources;
				views.updateStatusBar();
			}
			
			map.display();
			views.updateSelectionSidebar();
		},
		
		constructionCompleted: function(result)
		{
			var b = map.buildingForCoords(result.clientIndex, result.x, result.y);
			
			if (b)
			{
				// ready
				b.time = 0;
				
				if (result.clientIndex == client.index)
				{
					if (b.type == 5) {
						log.insert(buildingNameForType(b.type) + ' completed! Supply drop increased by ' + (client.upgrades['building'][5] ? 50 : 30) + '.', 10);
					} else {
						log.insert(buildingNameForType(b.type) + ' completed!', 10);
					}
					
					map.initBuildings(client.index);
				}
				
				map.display();
				views.listBase();
				views.updateSelectionSidebar();
				
				if (result.clientIndex == client.index) {
					map.calculateVisibleAreas();
				}
			}
		},
		
		constructionFailed: function(result)
		{
			if (result.error == 0) {
				log.insert("Not enough resources!", 12);
			} else if (result.error == 1) {
				log.insert("Map piece occupied!", 12);
			} else if (result.error == 2) {
				log.insert("Construction too far from base.", 12);
			}
		},

		handleJoin: function(result)
		{
			if (result.success)
			{
				map.reset();
				
				// console.log(result);
				
				map.data = result.map.data;
				map.width = result.map.width;
				map.height = result.map.height;
				
				game.maxPlayers = result.maxPlayers;
				game.power = result.power;
				
				map.buildings = [game.maxPlayers];
				map.units = [game.maxPlayers];
				
				for (var i = 0; i < game.maxPlayers; ++i)
				{
					map.buildings[i] = result.buildings[i];
					map.units[i] = result.units[i];
					
					if (!map.buildings[i]) {
						map.buildings[i] = [];
					}
					
					if (!map.units[i]) {
						map.units[i] = [];
					}
				}
				
				game.buildingDefs = result.baseBuildings;
				game.unitDefs = result.baseUnits;
				game.currentGameSessionActive = result.active;
			
				client.index = result.clientIndex;
				client.resources = result.resources;
				client.upgrades = result.upgrade;
				
				game.clientsInGame = result.clients;
				
				game.defeated = false;
				
				map.centerOn(map.buildings[client.index][0].x, map.buildings[client.index][0].y);
				map.initBuildings(client.index);
				map.initUnits(client.index);
				map.calculateVisibleAreas();

				game.setInGame(true, {'gameSession': result.gameSession, 'sessionName': result.sessionName});
			}
			else
			{
				if (result.reason == 'roomfull') {
					log.insert('Game room is full!', 12);
				} else if (result.reason == 'wrongpass') {
					log.insert('Missing/incorrect password.', 12);
				}
			}
		},
		
		/*sessionActiveStateChanged: function(result)
		{
			game.currentGameSessionActive = result.active;
			
			views.displayGame(0);
		},*/
		
		clientJoined: function(result)
		{
			if (result.clientIndex != client.index) {
				log.insert(result.client.name + ' has joined the room!', 15);
			}
			
			// console.log(result);
			
			game.clientsInGame[result.clientIndex] = result.client;
			
			map.buildings[result.clientIndex] = result.buildings;
			
			var previousActive = game.currentGameSessionActive;
			game.currentGameSessionActive = result.gameActive;
			
			if (previousActive == false && result.gameActive == true) {
				views.displayGame(0);
			} else {
				map.display();
				views.listGameInfo();
			}
		},
		
		clientLeft: function(result)
		{
			if (result.clientIndex != client.index) {
				log.insert(result.client.name + ' has left the room..', 15);
			}
			
			// console.log(result);
			
			game.clientsInGame[result.clientIndex] = null;
			
			// map.buildings[result.clientIndex] = [];
			//map.units[result.clientIndex] = [];
			

			var previousActive = game.currentGameSessionActive;
			game.currentGameSessionActive = result.gameActive;
			
			if (previousActive == true && result.gameActive == false) {
				views.displayGame(0);
			} else {
				views.listGameInfo();
				map.display();
			}
		},
		
		
		unitMoved: function(result)
		{
			var u  = map.units[result.clientIndex][result.unitIndex];
			
			u.x = result.x;
			u.y = result.y;
			
			if (result.clientIndex == client.index) {
				// map.discover(u.x, u.y, 3);
				map.calculateVisibleAreas();
			}
	
			map.display();
			views.updateSelectionSidebar();
		},
		
		say: function(result) {
			log.insert(result.text, result.color);
		},
		
		buildingSold: function(result)
		{
			var b = map.buildings[result.client][result.index];

			if (result.client == client.index) {
				log.insert(buildingNameForType(map.buildings[result.client][result.index].type) + ' sold!', 2);
				/*client.resources = result.resources;
				views.updateStatusBar();*/
			}
			
			map.buildings[result.client].splice(result.index, 1);

			map.display();
			views.listBase();
			views.updateSelectionSidebar();
		},
		
		tileChanged: function(result)
		{
			if (result.attackerClient == client.index) {
				log.insert('Forest cleared!', 2);
			}
			
			map.setDataAt(result.x, result.y, result.value);
			map.display();
		},
		
		unitConditionChanged: function(result)
		{
			var u = map.units[result.client][result.index];
			u.condition = result.condition;

			if (result.client == client.index)
			{
				if (map.isCoordVisible(u.x, u.y))
				{
					u.blink = 2;
					setTimeout(function() { u.blink = 0; map.display(); }, 290);
					map.display();
				}
	
				views.listUnits();
				views.updateSelectionSidebar();
			}
		},
		
		buildingRepaired: function(result) {
			var b = map.buildings[result.client][result.index];
			b.condition = result.condition;	
			if (result.client == client.index) {
				var now = (Date.now() / 1000);
				if ((now - responseHandler.lastBuildingRepairMessageTime) >= 8) {
					responseHandler.lastBuildingRepairMessageTime = now;
					log.insert(buildingNameForType(map.buildings[result.client][result.index].type) + ' is being repaired.', 2);
				}
				if (map.isCoordVisible(b.x, b.y)) {
					b.blink = 2;
					setTimeout(function() { b.blink = 0; map.display(); }, 290);
					map.display();
				}
				views.listBase();
				views.updateSelectionSidebar();
			}
		},
		
		unitHit: function(result)
		{
			var now = (Date.now() / 1000);
			var u = map.units[result.targetClient][result.index];
			
			// console.log('hit');
			// console.log(result);
			
			u.condition = result.condition;
			
			if (map.isCoordVisible(u.x, u.y))
			{
				u.blink = 1;
				setTimeout(function() { u.blink = 0; map.display(); }, 290);
				map.display();
			}
				
			if (result.targetClient == client.index && (now - responseHandler.lastUnitUnderAttackMessageTime) >= 8)
			{
				responseHandler.lastUnitUnderAttackMessageTime = now;
				
				log.insert('Your unit is under attack!', 12);
			}
			
			views.listUnits();
			views.updateSelectionSidebar();
		},
		
		// A whole bunch of units destoryed at once
		unitsDestroyed: function(result)
		{
			console.log('some units destroyed');
			console.log(result);
			
			for (var i = 0; i < game.maxPlayers; ++i)
			{
				if (i == client.index && result.units[i].length > 0) {
					log.insert("Units crushed beneath a construction!", 12);
				}
				
				for (var ui = result.units[i].length - 1; ui >= 0; --ui) {
					map.units[i].splice(result.units[i][ui], 1);
				}
			}
			
			views.updateSelectionSidebar();
			views.listUnits();
			map.display();
		},
		
		unitDestroyed: function(result)
		{	
			console.log('unitDestroyed');
			console.log(result);
			
			if (result.attackerClient == client.index) {
				log.insert("You've destroyed an enemy " + unitNameForType(map.units[result.targetClient][result.index].type)+"!", 10);
			} else if (result.targetClient == client.index) {
				log.insert("You've lost a " + unitNameForType(map.units[result.targetClient][result.index].type)+"!", 12);
			}
			
			var scoords = map.getSelectionCoords();
			
			var sx = map.units[result.targetClient][result.index].x;
			var sy = map.units[result.targetClient][result.index].y;
			
			
			// Remove the unit
			map.units[result.targetClient].splice(result.index, 1);
			
			if (scoords != null && (scoords.x == sx && scoords.y == sy))
			{
				// Keep this tile selected if there are more units on it
				if (map.unitsAtCoord(sx, sy).length > 0) {
					game.selectTile(sx, sy, -1);
					views.updateSelectionSidebar();
				} else {
					map.clearSelection();
					views.updateSelectionSidebar();
				}
			}
			
			if (result.targetClient == client.index) {
				map.calculateVisibleAreas();
			}
			
			map.display();
			views.listBase();			
		},
		
		buildingHit: function(result)
		{
			var b = map.buildings[result.targetClient][result.index];
			b.condition = result.condition;
	
			if (result.targetClient == client.index)
			{
				var now = (Date.now() / 1000);
				
				if ((now - responseHandler.lastBuildingUnderAttackMessageTime[b.type]) >= 7)
				{
					responseHandler.lastBuildingUnderAttackMessageTime[b.type] = now;
					
					log.insert(buildingNameForType(b.type)+" is under attack by " + game.clientsInGame[result.attackerClient].name + "!", 12);
				}
			}
			
			if (map.isCoordVisible(b.x, b.y))
			{
				b.blink = 1;
				setTimeout(function() { b.blink = 0; map.display(); }, 290);
				map.display();
			}
			
			views.updateSelectionSidebar();
			views.listBase();
		},
		
		buildingDestroyed: function(result)
		{
			map.setDataAt(map.buildings[result.targetClient][result.index].x, map.buildings[result.targetClient][result.index].y, 0);
						
			if (result.attackerClient == client.index) {
				log.insert("You've destroyed the enemy " + buildingNameForType(map.buildings[result.targetClient][result.index].type)+"!", 10);
			} else if (result.targetClient == client.index) {
				log.insert("Your " + buildingNameForType(map.buildings[result.targetClient][result.index].type)+" has been destroyed!", 12);
			}
			
			// Remove the building
			map.buildings[result.targetClient].splice(result.index, 1);
			
			// Had it selected ... not any more
			if (map.selectionType == 'building' && map.selectionOwner == result.targetClient && map.selectionIndex == result.index) {
				map.clearSelection();	
			}
		
			if (result.targetClient == client.index) {
				map.calculateVisibleAreas();
			}
		
			map.display();
			views.listBase();			
		},
		
		move: function(result)
		{

		},
		
		attack: function(result)
		{

		},
		
		select: function(result)
		{

		},
		

		resourceDrop: function(result) {
			client.resources = result.resources;
			views.updateStatusBar();
			views.updateSelectionSidebar();
		},
		
		msg: function(result)
		{
			if (result.lobby && views.current == 2)
			{
				log.insert(result.message, result.color);
			}
			else if (!result.lobby && views.current == 3)
			{
				log.insert(result.message, result.color);
			}
		},
		
		upgradeStarted: function(result)
		{
			// console.log('upgradeStarted');
			// console.log(result);
			
			client.resources = result.resources;
			views.updateStatusBar();
			
			if (result.params.upgradeType == 'building') {
				log.insert('Upgrading ' + buildingNameForType(result.params.type) + '.. ', 10);
			} else if (result.params.upgradeType == 'unit') {
				log.insert('Upgrading ' + unitNameForType(result.params.type) + '.. ', 10);
			}
		},
		
		upgradeCompleted: function(result)
		{
			// console.log('upgradeCompleted');
			// console.log(result);

			client.upgrades[result.params.upgradeType][result.params.type] = true;
			
			if (result.params.upgradeType == 'building') {
				if (result.params.type == 2) {
					log.insert(buildingNameForType(result.params.type) + ' upgraded! New units available.', 10);
				} else if (result.params.type == 3) {
					log.insert(buildingNameForType(result.params.type) + ' upgraded! New units available.', 10);
				} else {
					log.insert(buildingNameForType(result.params.type) + ' upgraded!', 10);
				}
			} else if (result.params.upgradeType == 'unit') {
				log.insert(unitNameForType(result.params.type) + ' upgraded!', 10);
			}
			
			if (result.buildingType == 2 || result.buildingType == 3) {
				log.insert('New units available', 15);
			}
			
			views.updateSelectionSidebar();
		},
		
		upgradeFailed: function(result)
		{
			// console.log('upgradeFailed');
			// console.log(result);
			
			if (result.error == 0) {
				log.insert('Not enough resources!', 12);
			}
		},
		
		gameOver: function(result) {
			views.showGameOverScreen(result);
		},
		
		powerChange: function(result)
		{
			var prevPowerState = game.power;
			
			game.power = result;
			
			views.updateStatusBar();
			views.listBase();
			
			if ((prevPowerState.required > prevPowerState.level) && result.required <= result.level) {
				setTimeout("log.insert('Base power online!', 2)", 800);	
			} else if ((prevPowerState.required <= prevPowerState.level) && result.required > result.level) {
				setTimeout("log.insert('Base power offline!', 4)", 800);	
			}
			
		},
		
		playerDefeated: function(result)
		{
			if (result.clientIndex == client.index) {
				log.insert('You have been defeated..', 4);
				game.defeated = true;
				map.selectionType = 'none';
				map.selectionIndex = -1;
				views.updateSelectionSidebar();
			} else {
				log.insert(game.clientsInGame[result.clientIndex].name + ' has been defeated!', 2);
			}
		},
		
		lastUnitUnderAttackMessageTime: 0,
		lastBuildingRepairMessageTime: 0,
		lastBuildingUnderAttackMessageTime: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	}
});