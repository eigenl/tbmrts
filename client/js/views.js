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
	views = {
	
		showLandingPage: function()
		{
			views.current = 1;
			
			log.visible = false;
			
			display.clear();
	
			display.print(0, 0, '                           Text Based Multiplayer RTS', {'bg': 4, 'fg': 14, 'fillToEnd': true});
			
			display.print(0, 2, ' ' + String.fromCharCode(9658) + ' Overview ', {'bg': 1, 'fg': 11, 'fillToEnd': true});
			display.print(0, 4, 'Welcome to Text Based Multiplayer RTS or TBMRTS for short. In this game you must take on other players in real-time strategy only using textual commands. You have different ground and air vehicles under your command and a base to protect.', {'fg': 15, 'wrapText': true});
			display.print(0, 8, "This is a spiritual (and technical) successor to Text Based Multiplayer Shooter, a game I worked on last year. It was a lot of fun but limiting due to the crappy backend solution.", {'fg': 15, 'wrapText': true});
			
			display.print(0, 13, ' ' + String.fromCharCode(9658) + ' Early build ', {'bg': 1, 'fg': 11, 'fillToEnd': true});
			display.print(0, 15, 'This is an early build and may have stability issues. A lot of stuff is yet to be finished.', {'fg': 15, 'wrapText': true});
			
			display.print(0, 19, ' ' + String.fromCharCode(9658) + ' Getting started ', {'bg': 1, 'fg': 11, 'fillToEnd': true});
			display.print(0, 21, "First things first. To log into the game type 'LOGIN <USERNAME> <PASSWORD>'. Please don't include the angled brackets. Your account is automatically created the first time.", {'fg': 15});
		},
		
		drawBorders: function()
		{
			if (views.current != 3) {
				display.print(0, 0, '                           Text Based Multiplayer RTS', {'bg': 4, 'fg': 14, 'fillToEnd': true});
			} else {
				views.updateStatusBar();
			}
			
			display.print(0, 1, '╔══════════════════════════════════════════════════════════════════════════════╗', {'fg': 4});
			
			display.print(0, 19, ' ══════════════════════════════════════════════════════════════════════════════ ', {'fg': 4});
			
			if (views.current == 3 && game.currentGameSessionActive == true)
			{
				display.print(43, 1, '╦', {'fg': 4});
				
				for (var yy = 2; yy < 19; ++yy) {
					display.print(43, yy, '║', {'fg': 4});
				}
				
				display.print(43, 19, '╩', {'fg': 4});
			}
			
			for (var yy = 2; yy < 19; ++yy) {
				display.print(0, yy, '║', {'fg': 4});
				display.print(79, yy, '║', {'fg': 4});
			}
			
			display.print(0, 19, '╠', {'fg': 4}); display.print(79, 19, '╣', {'fg': 4});
			display.print(0, 20, '║', {'fg': 4}); display.print(79, 20, '║', {'fg': 4});
			display.print(0, 21, '║', {'fg': 4}); display.print(79, 21, '║', {'fg': 4});
			display.print(0, 22, '║', {'fg': 4}); display.print(79, 22, '║', {'fg': 4});
			display.print(0, 23, '║', {'fg': 4}); display.print(79, 23, '║', {'fg': 4});
			display.print(0, 24, '║', {'fg': 4}); display.print(79, 24, '║', {'fg': 4});
			display.print(0, 25, '║', {'fg': 4}); display.print(79, 25, '║', {'fg': 4});
			display.print(0, 26, '║', {'fg': 4}); display.print(79, 26, '║', {'fg': 4});
			display.print(0, 27, '╚══════════════════════════════════════════════════════════════════════════════╝', {'fg': 4});
		},
		
		displayMainMenu: function(segment)
		{
			this.current = 2;
			this.lobby.segment = segment;
			log.visible = true;
			
			this.drawBorders();

			display.clearRect(1, 2, 78, 17);
			
			display.print(2, 2, '                LOBBY                ', {'bg': (segment==0?2:8), 'fg': (segment==0?10:7)});
			display.print(40, 2, '                NEW GAME              ', {'bg': (segment==1?2:8), 'fg': (segment==1?10:7)})
			
			if (segment == 0)
			{
				lobby.displayList();
			}
			else if (segment == 1)
			{
				display.print(2, 4, '        Game name:', {'bg': 0, 'fg': 11});
				display.print(2, 5, 'Number of players:', {'bg': 0, 'fg': 11});
				display.print(2, 6, '         Password:', {'bg': 0, 'fg': 11});
				display.print(21, 4, views.lobby.name, {'fg': 14});
				display.print(21, 5, views.lobby.players.toString(), {'fg': 14});
				display.print(21, 6, views.lobby.password, {'fg': 14});
				display.print(6, 15, "To set the game name, type 'SET NAME <name>'. To change the maximum number of players type 'SET PLAYERS <number>'.", {'maxLength': 70});
				display.fillRect(2, 15, 3, 4, 1);
				display.print(6, 18, "Type 'CREATE' to finish up.");
				
				display.print(3, 16, 'i', {fg: 11, bg: 1});
			}

			log.display();
		},
		
		displayGame: function(segment)
		{
			views.current = 3;
			views.inGame.segment = segment;
			
			display.clear();
			
			this.drawBorders();

			// Game's not active yet
			if (game.currentGameSessionActive == false)
			{
				display.print(22, 10, '╔═════════════════════════════════╗', {'bg': 2, 'fg': 10});
				display.print(22, 11, '║    Waiting for more players..   ║', {'bg': 2, 'fg': 10});
				display.print(22, 12, '╚═════════════════════════════════╝', {'bg': 2, 'fg': 10});
			
				if (views.showMore != 0) {
					display.print(69, 27, '╣      ╠', {'fg': 4});
					display.print(71, 27, 'MORE', {'fg': 14});
				}
				
				log.display();
				
				return;
			}
			
			display.print(2, 2, '   MAP    ', {'bg': (segment==0?2:8), 'fg': (segment==0?10:7)});
			display.print(13, 2, '  UNITS  ', {'bg': (segment==1?2:8), 'fg': (segment==1?10:7)})
			display.print(23, 2, '  BASE  ', {'bg': (segment==2?2:8), 'fg': (segment==2?10:7)})
			display.print(32, 2, '   INFO   ', {'bg': (segment==3?2:8), 'fg': (segment==3?10:7)})
			
			if (segment == 0)
			{
				map.display();
			}
			else if (segment == 1)
			{
				views.listUnits();
			}
			else if (segment == 2)
			{
				views.listBase();
			}
			else if (segment == 3)
			{
				views.listGameInfo();
			}
			
			log.display();
			
			if (views.showMore != 0)
			{
				display.print(69, 27, '╣      ╠', {'fg': 4});
				display.print(71, 27, 'MORE', {'fg': 14});
			}

			views.updateSelectionSidebar();
		},
		
		listUnits: function()
		{
			// "Units" segment not selected
			if (views.inGame.segment != 1) {
				return;
			}
			
			display.clearRect(1,4,41,15);
			
			display.print(2, 4, 'Unit', {'fg': 11});
			display.print(25, 4, 'Coord.', {'fg': 11});
			display.print(33, 4, 'Condition', {'fg': 11});
			
			var pageSize = 12;
			var pages = Math.max(Math.ceil(map.units[client.index].length / pageSize), 1);
			var start = views.unitPage * pageSize;
			var end = Math.min(start + pageSize, map.units[client.index].length);

			for (var i = start; i < end; ++i)
			{
				display.print(2, 5+(i-start), unitNameForType(map.units[client.index][i].type), {'fg': 15});
				display.print(25, 5+(i-start), map.characters.charAt(map.units[client.index][i].x)+(map.units[client.index][i].y+1), {'fg': 14});
				
				if ((map.units[client.index][i].condition / game.unitDefs[map.units[client.index][i].type].health) < 0.6) {
					display.print(33, 5+(i-start), map.units[client.index][i].condition+'/'+game.unitDefs[map.units[client.index][i].type].health, {'fg': 12});
				} else {
					display.print(33, 5+(i-start), map.units[client.index][i].condition+'/'+game.unitDefs[map.units[client.index][i].type].health, {'fg': 15});
				}
			}
			
			// There are more pages
			if (map.units[client.index].length > end) {
				display.print(26, 18, 'Next ►', {fg: 9});
			} else {
				display.print(26, 18, 'Next ►', {fg: 8});
			}
			
			if (views.unitPage > 0) {
				display.print(11, 18, '◄ Prev', {fg: 9});
			} else {
				display.print(11, 18, '◄ Prev', {fg: 8});
			}
			
			var pageStr = (views.unitPage+1)+'/'+pages;
			
			display.print(21 - (pageStr.length-1) / 2, 18, pageStr, {fg: 3});
		},
		
		listBase: function()
		{
			// "Base" segment not selected
			if (views.inGame.segment != 2) {
				return;
			}
			
			display.clearRect(1,4,41,15);
			
			display.print(2, 4, 'Power usage', {'fg': 11});
			display.print(25, 4, 'Output', {'fg': 11});
			display.print(33, 4, 'Max.', {'fg': 11});
			display.print(2, 5, game.power.required.toString() + ' u.', {'fg': 9});
			display.print(25, 5, game.power.level.toString() + ' u.', {'fg': 2});
			display.print(33, 5, game.power.max.toString() + ' u.', {'fg': 3});
			
			display.print(2, 7, 'Building', {'fg': 11});
			display.print(25, 7, 'Coord.', {'fg': 11});
			display.print(33, 7, 'Condition', {'fg': 11});
			
			var pageSize = 9;
			var pages = Math.max(Math.ceil(map.buildings[client.index].length / pageSize), 1);
			var start = views.basePage * pageSize;
			var end = Math.min(start + pageSize, map.buildings[client.index].length);
			
			// for (var i = 0; i < map.buildings[client.index].length; ++i)
			for (var i = start; i < end; ++i)
			{
				display.print(2, 8+(i-start), buildingNameForType(map.buildings[client.index][i].type), {'fg': 15});
				display.print(25, 8+(i-start), map.characters.charAt(map.buildings[client.index][i].x)+(map.buildings[client.index][i].y+1), {'fg': 14});
				
				if ((map.buildings[client.index][i].condition / game.buildingDefs[map.buildings[client.index][i].type].health) <= 0.25) {
					display.print(33, 8+(i-start), map.buildings[client.index][i].condition+'/'+game.buildingDefs[map.buildings[client.index][i].type].health, {'fg': 4});
				} else if ((map.buildings[client.index][i].condition / game.buildingDefs[map.buildings[client.index][i].type].health) < 0.6) {
					display.print(33, 8+(i-start), map.buildings[client.index][i].condition+'/'+game.buildingDefs[map.buildings[client.index][i].type].health, {'fg': 12});
				} else {
					display.print(33, 8+(i-start), map.buildings[client.index][i].condition+'/'+game.buildingDefs[map.buildings[client.index][i].type].health, {'fg': 15});
				}
			}
			
			// There are more pages
			if (map.buildings[client.index].length > end) {
				display.print(26, 18, 'Next ►', {fg: 9});
			} else {
				display.print(26, 18, 'Next ►', {fg: 8});
			}
			
			if (views.basePage > 0) {
				display.print(11, 18, '◄ Prev', {fg: 9});
			} else {
				display.print(11, 18, '◄ Prev', {fg: 8});
			}
			
			var pageStr = (views.basePage+1)+'/'+pages;
			
			display.print(21 - (pageStr.length-1) / 2, 18, pageStr, {fg: 3});
		},
		
		listGameInfo: function()
		{
			if (this.inGame.segment != 3) {
				return;
			}
			
			display.clearRect(1,4,41,15);
			
			display.print(2, 4, '   Name:', {'fg': 11});
			display.print(11, 4, game.currentGameSessionName, {'fg': 15});
			display.print(2, 5, '    Map:', {'fg': 11});
			display.print(11, 5, map.width.toString() + ' x ' + map.height.toString(), {'fg': 15});
			display.print(2, 6, 'Players:', {'fg': 11});

			var clientsStr = '';
			
			for (k in game.clientsInGame) {
				if (game.clientsInGame[k] == null) {
					continue;
				}
				
				if (clientsStr.length == 0) {
					clientsStr = game.clientsInGame[k].name;
				} else {
					clientsStr += ', ' + game.clientsInGame[k].name;
				}
			}
			
			display.print(11, 6, clientsStr, {'fg': 15});
		},
		
		updateSelectionSidebar: function()
		{
			display.clearRect(45, 3, 33, 16);
			display.print(45, 2, '            SELECTION', {'fill': 12, 'bg': 6, 'fg': 14});
			
			map.selectedCoords = {x:-1, y:-1};
			
			if (map.selectionType != 'none')
			{
				display.print(45, 4, '       Type:', {'fg': 10});
				display.print(45, 5, 'Coordinates:', {'fg': 10});
			}
			
			if (map.selectionType == 'tile')
			{
				var coords = map.selectionIndexToCoords();
				var tileData = map.data.charAt(map.selectionIndex);
				
				if (tileData == 0) {
					display.print(58, 4, 'Terrain');
				} else if (tileData == 1) {
					display.print(58, 4, 'Forest');
				}
				map.selectedCoords = {x:coords.x,y:coords.y};
				display.print(58, 5, map.characters.charAt(coords.x)+(coords.y+1));
			}
			else if (map.selectionType == 'unit')
			{
				display.print(58, 4, 'Units');
				
				var selectedCount = 0;
				var selected = [];
				var unit_ = null;
				
				for (var u = 0; u < map.units[map.selectionOwner].length; ++u) {
					if (map.units[map.selectionOwner][u].selected == true) {
						selectedCount ++;
						unit_ = map.units[map.selectionOwner][u];
						selected.push(unit_);
						if (selectedCount == 10) {
							break;
						}
					}
				}
				
				if (unit_ ) {
					map.selectedCoords = {x:unit_.x,y:unit_.y};
					display.print(58, 5, map.characters.charAt(unit_.x)+(unit_.y+1));
				}
			
				display.print(45, 6, '   Selected:', {'fg': 10});
				display.print(58, 6, selectedCount.toString());
				var y = 8;
				
				if (map.selectionOwner != client.index) {
					display.print(45, 7, '      Owner:', {'fg': 10});
					display.print(58, 7, game.clientsInGame[map.selectionOwner].name);
					y = 9;
				}
				
				for (var i = 0; i < selected.length; ++i)
				{
					display.print(45, y+i, ((i+1) < 10 ? '0' : '') + (i+1).toString(), {fg:3});
					display.print(48, y+i, unitNameForType(selected[i].type));
					var conditionStr = selected[i].condition+'/'+game.unitDefs[selected[i].type].health;
					display.print(78-conditionStr.length, y+i, conditionStr, {'fg': 14});
				}
			}
			else if (map.selectionType == 'building')
			{
				var b = map.buildings[map.selectionOwner][map.selectionIndex];
				
				display.print(58, 4, buildingNameForType(b.type));

				if (b.time == 0 || !b.time)
				{
					display.print(45, 6, '  Condition:', {'fg': 10});
					display.print(58, 6, b.condition+'/'+game.buildingDefs[b.type].health);
					
		
					if (map.selectionOwner == client.index)
					{
						if (b.type != 4) {
							display.print(45, 7, '   Upgraded:', {'fg': 10});
							if (client.upgrades['building'][b.type] == false) {
								display.print(58, 7, 'No');
							} else {
								display.print(58, 7, 'Yes');
							}
						}
						
						// Command center
						if (b.type == 0)
						{
							display.print(45, 9, '       Available to BUILD', {'fg': 9});
							
							var availableConstructionOptions = client.getConstructionOptions();

							for (var i = 0; i < availableConstructionOptions.length; ++i)
							{
								// name
								display.print(45, 11 + i, buildingNameForType(availableConstructionOptions[i]), {'fg': 15});
								// cost
								var cost = game.buildingDefs[availableConstructionOptions[i]].cost;
								display.print(78 - cost.toString().length, 11 + i, cost.toString(), {'fg': (client.resources >= cost ? 10 : 12)});
							}
						}
						// Barracks
						else if (b.type == 2)
						{
							display.print(45, 8, '   In queue:', {'fg': 10});
							display.print(58, 8, game.barracksQueueLength.toString());
							
							display.print(45, 10, '       Available to TRAIN', {'fg': 9});
							
							var availableTrainingOptions = client.getTrainingOptions();
							
							for (var i = 0; i < availableTrainingOptions.length; ++i)
							{
								// name
								display.print(45, 12 + i, unitNameForType(availableTrainingOptions[i]), {'fg': 15});
								// cost
								var cost = game.unitDefs[availableTrainingOptions[i]].cost;
								display.print(78 - cost.toString().length, 12 + i, cost.toString(), {'fg': (client.resources >= cost ? 10 : 12)});
							}
						}
						// Factory
						else if (b.type == 3)
						{
							display.print(45, 8, '   In queue:', {'fg': 10});
							display.print(58, 8, game.factoryQueueLength.toString());
							
							display.print(45, 10, '       Available to BUILD', {'fg': 9});
							
							var availableBuildOptions = client.getFactoryBuildOptions();
							
							for (var i = 0; i < availableBuildOptions.length; ++i)
							{
								// name
								display.print(45, 12 + i, unitNameForType(availableBuildOptions[i]), {'fg': 15});
								// cost
								var cost = game.unitDefs[availableBuildOptions[i]].cost;
								display.print(78 - cost.toString().length, 12 + i, cost.toString(), {'fg': (client.resources >= cost ? 10 : 12)});
							}
						}
						// LAB
						else if (b.type == 4)
						{
							display.print(45, 8, '        Upgrade buildings', {'fg': 9});
						
							var bUpgradeOptions = client.getBuildingUpgradeOptions();
							
							for (var i = 0; i < bUpgradeOptions.length; ++i)
							{
								// name
								display.print(45, 10 + i, buildingNameForType(bUpgradeOptions[i]), {'fg': 15});
								// cost
								var cost = game.buildingDefs[bUpgradeOptions[i]].upgrade.cost;
								display.print(78 - cost.toString().length, 10 + i, cost.toString(), {'fg': (client.resources >= cost ? 10 : 12)});
							}
						}
					}
					else
					{
						display.print(45, 7, '      Owner:', {'fg': 10});
						display.print(58, 7, game.clientsInGame[map.selectionOwner].name);
					}
				} else {
					display.print(48, 7, '    Under construction..', {'fg': 3});
				}
				
				map.selectedCoords = {x:b.x,y:b.y};
				display.print(58, 5, map.characters.charAt(b.x)+(b.y+1));
			}
		},
		
		updateStatusBarAfterTimeout: function() {
			views.statusBarPowerOfflineTimer = null
			
			if (views.statusBarPowerOfflineBlink == 0) {
				views.statusBarPowerOfflineBlink = 1;
			} else {
				views.statusBarPowerOfflineBlink = 0;
			}
			
			views.updateStatusBar();
		},
		
		updateStatusBar: function()
		{
			if (views.current == 3)
			{ 
				display.print(0, 0, ' Supplies', {bg: 4, fg: 14, 'fillToEnd': true});
				display.print(10, 0, client.resources.toString(), {bg:4, fg:15});
				display.print(0, 0, '|', {bg:4, fg:12});
				display.print(9, 0, '|', {bg:4, fg:12});
				display.print(10 + client.resources.toString().length, 0, '|', {bg:4, fg:12});
				
				display.print(61, 0, '|', {bg:4, fg:12});
				display.print(62, 0, 'Power', {'bg': 4, 'fg': 14});
				display.print(67, 0, '|', {bg:4, fg:12});
				
				display.print(68, 0, '           ', {bg: 2});
				display.print(68, 0, '           '.substring(0, 11 * game.power.required / game.power.max), {bg: 10});
				
				if (game.power.max > 0)
				{
					var productionCut = 1.0 - (game.power.level / game.power.max);
					
					display.print(79 - Math.floor(11 * productionCut), 0, '           '.substring(0, 11 * productionCut), {bg: 8});
				}
				
				display.print(79, 0, '|', {bg:4, fg:12});
						
				if (game.power.required > game.power.level)
				{
					if (views.statusBarPowerOfflineTimer == null) {
						views.statusBarPowerOfflineTimer = setTimeout('views.updateStatusBarAfterTimeout()', 500);
					}
					
					if (views.statusBarPowerOfflineBlink == 0) {
						display.print(62, 0, 'Power', {'bg': 4, 'fg': 12});
					}
					
					var productionMiss = 1.0 - (game.power.level / game.power.required);
					
					display.print(68, 0, '           ', {bg: 2});
					display.print(79 - Math.floor(11 * productionMiss), 0, '           '.substring(0, 11 * productionMiss), {bg: 12});
				}
			}
		},
		
		showGameOverScreen: function(result)
		{
			views.current = 4;
			
			log.visible = false;
			log.clear();
			
			game.currentGameSessionId = null;
			game.currentGameSessionActive = false;
			game.currentGameSessionName = null;
			game.clientsInGame = [];
			
			requests.getGameSessions();
			
	
			display.clear();
			
			display.print(0, 0, '╔══════════════════════════════════════════════════════════════════════════════╗', {'fg': 4});
			display.print(0, 27, '╚══════════════════════════════════════════════════════════════════════════════╝', {'fg': 4});

			for (var i = 1; i < 27; ++i) {
				display.print(0, i, '║', {'fg': 4});
				display.print(79, i, '║', {'fg': 4});	
			}
	
			display.print(31, 4, "╒═══════════════╕", {fg:10, bg:2});
			display.print(31, 5, "│   GAME OVER   │", {fg:10, bg:2});
			display.print(31, 6, "╘═══════════════╛", {fg:10, bg:2});
				
			if (result.winner) {
				display.print(30, 12, "You were victorious!", {fg:14});
			} else {
				display.print(30, 12, "You were defeated..", {fg:12});
			}
			
			display.print(34, 27, '╣          ╠', {'fg': 4});
			display.print(36, 27, 'CONTINUE', {'fg': 14});
			
		},
		
		nextUnitPage: function() {
			var pages = Math.ceil(map.units[client.index].length / 12);
			if (views.unitPage+1 < pages) { views.unitPage += 1; views.listUnits(); }		
		},
		
		prevUnitPage: function() {
			if (views.unitPage > 0) { views.unitPage -= 1; views.listUnits(); }		
		},
	
		nextBasePage: function() {
			var pages = Math.ceil(map.buildings[client.index].length / 10);
			if (views.basePage+1 < pages) { views.basePage += 1; views.listBase(); }		
		},
		
		prevBasePage: function() {
			if (views.basePage > 0) { views.basePage -= 1; views.listBase(); }		
		},
		
		/*
			Views
			
			1 Landing page
			2 Lobby
			3 In-game
			4 Game over
		*/
		current: 0,
		
		/*
			0 Lobby
			1 New game
		*/
		lobby: {
			'segment': 0,
			'name': 'NEW GAME',
			'players': 2,
			'password': ''
		},
		
		/*
			0 Map
			1 Units
			2 Buildings
		*/
		inGame: {
			'segment': 0
		},
		
		statusBarPowerOfflineBlink: 0,
		statusBarPowerOfflineTimer: null,
		showMore: 0,
		unitPage: 0,
		basePage: 0
	}
});