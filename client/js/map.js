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
	map = {
		data: '',
		discovered: null,
		width: 0,
		height: 0,
		d: 0,
		offsetX: 0,
		offsetY: 0,
		selectionType: 'none',
		selectionIndex: -1,
		selectionOwner: -1,
		characters: "ABCDEFGHIJKLMNOPQRSTUVXYZ",
		buildings: null,
		units: null,
		selectedCoords: null,
		unitCycleTimeout: null,
		unitCycleCounter: 0,
		selectedTileCoords: [],

		reset: function() {
			this.buildings = [[],[],[],[]];
			this.units = [[],[],[],[]];
			this.selectionType = 'none';
			this.selectionIndex = -1;
			this.selectionOwner = -1;
		},
		
		clearSelection: function() {
			this.selectionType = 'none';
			this.selectionIndex = -1;
			this.selectionOwner = -1;
		},
		
		setDataAt: function(x, y, d) {
			this.data = this.data.substr(0, (y * this.width) + x) + d + this.data.substr((y * this.width) + x+1);
		},
		
		getDataAt: function(x, y) {
			return map.data.charAt((y * map.width) + x);
		},
		
		selectionIndexToCoords: function() {
			var y = Math.floor(map.selectionIndex / map.width)
			var x = (map.selectionIndex - y * map.width);
			return {'x': x, 'y': y};
		},
		
		unitsAtCoord: function(x, y) {
			return $.grep(this.units[client.index], function(e) { return (e.x == x && e.y == y); });
		},
		
		allUnitsAtCoord: function(x, y) {
			var result = [];
			for (var i=0;i<game.maxPlayers;i++) {
				if (!map.units[i]) {
					continue;	
				}
				for (var j=0;j<this.units[i].length;j++) {
					var u = this.units[i][j];
					if (u.x == x && u.y == y) {
						result.push({'unit': u, 'client': i});	
					}
				}
			}
			return result;
		},	
		
		unselectAllUnits: function()
		{
			for (var i=0;i<game.maxPlayers;i++) {
				if (!map.units[i]) { continue; }
				for (var j=0;j<this.units[i].length;j++) {
					this.units[i][j].selected = false;
				}
			}
		},
		
		buildingsOfType: function(type) {
			return $.grep(this.buildings[client.index], function(e) { return e.type == type; });
		},
		
		isSpawnpoint: function(x, y)
		{
			for(var i=0; i < map.buildings[client.index].length; ++i) {
				var b =  map.buildings[client.index][i];
				if (b.spawnpoint && b.spawnpoint.x == x && b.spawnpoint.y == y) {
					return true;
				}
			}
			
			return false;
		},
		
		shuffle: function(o) {
		    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		    return o;
		},
				
		spawnPointAroundPoint: function(x, y)
		{
			var indexes = this.shuffle([0,1,2,3,4,5,6,7]);

			for (var j = 0; j < 8; ++j) {
				var i = indexes[j];
				var _x, _y;
				if (i == 0) { _x = x - 1; _y = y + 1; }
				else if (i == 1) { _x = x; _y = y + 1; }
				else if (i == 2) { _x = x + 1; _y = y + 1; }
				else if (i == 3) { _x = x + 1; _y = y; }
				else if (i == 4) { _x = x + 1; _y = y - 1; }
				else if (i == 5) { _x = x; _y = y - 1; }
				else if (i == 6) { _x = x - 1; _y = y - 1; }
				else if (i == 7) { _x = x - 1; _y = y; }
				
				if (_x < 0 || _x >= map.width || _y < 0 || _y >= map.height) {
					continue;
				}
				
				if (map.buildingForCoords(client.index, _x, _y)) {
					continue;
				}
				
				if (map.getDataAt(_x, _y) == 0) {
					return {'x': _x, 'y': _y};
				}
			}
			
			return null;
		},
		
		alphaToIndex: function(letter) {
			for (var i=0;i<map.characters.length;i++) {
				if (map.characters.charAt(i)==letter) { return i; }
			}
			return -1;
		},
		
		buildingForCoords: function(clientIndex, x, y)
		{
			if (clientIndex == -1)
			{
				for(var c=0; c < game.maxPlayers; ++c)
				{
					if (!map.buildings[c]) {
						continue;	
					}
					
					for(var i=0; i < map.buildings[c].length; ++i)
					{
						if (map.buildings[c][i].x == x && map.buildings[c][i].y == y) {
							return map.buildings[c][i];
						}
					}
				}
			}
			else
			{
				for(var i=0; i < map.buildings[clientIndex].length; ++i) {
					if (map.buildings[clientIndex][i].x == x && map.buildings[clientIndex][i].y == y) {
						return map.buildings[clientIndex][i];
					}
				}
			}
		
			return null;
		},
		
		getBuildingByType: function(clientIndex, buildingType)
		{
			for (var i=0; i < map.buildings[clientIndex].length; ++i) {
				if (map.buildings[clientIndex][i].type == buildingType) {
					return map.buildings[clientIndex][i];
				}				
			}
			
			return null;
		},
		
		hasBuildingType: function(clientIndex, buildingType)
		{
			for(var i=0; i < map.buildings[clientIndex].length; ++i) {
				if (map.buildings[clientIndex][i].type == buildingType && (!map.buildings[clientIndex][i].time || map.buildings[clientIndex][i].time == 0))
				{
					return true;
				}				
			}
			
			return false;
		},
		
		isDiscovered: function(x, y)
		{
			return map.discovered[(y * map.width) + x];
		},
		
		getSelectionCoords: function()
		{
			if (map.selectionType == 'tile') {
				var y = Math.floor(map.selectionIndex / map.width);
				var x = (map.selectionIndex / (y * map.width));
				return {'x': x, 'y': y};
			} else if (map.selectionType == 'unit' && map.selectionIndex < map.units[map.selectionOwner].length) {
				var u = map.units[map.selectionOwner][map.selectionIndex];
				return {'x': u.x, 'y': u.y};
			} else if (map.selectionType == 'building' && map.selectionIndex < map.buildings[map.selectionOwner].length) {
				var b = map.buildings[map.selectionOwner][map.selectionIndex];
				return {'x': b.x, 'y': b.y};
			}
			
			return null;
		},
		
		isCoordSelected: function(x, y)
		{
			for (var i = 0; i < map.selectedTileCoords.length; ++i) {
				if (map.selectedTileCoords[i].x == x && map.selectedTileCoords[i].y == y) {
					return true;
				}
			}
			
			return false;
		},
		
		display: function()
		{
			if (views.inGame.segment != 0 || game.currentGameSessionActive == false || game.currentGameSessionId == null) {
				return;
			}
			
			display.clearRect(1,4,41,15);
			
			var highlightedX=-1, highlightedY=-1;
			
			map.selectedTileCoords = [];
			
			for (var y = map.offsetY; y < (map.offsetY + 14); y++)
			{
				for (var x = map.offsetX; x < (map.offsetX + 19); x++)
				{
					if (map.isDiscovered(x, y) == false) {
						continue;
					}
					
					map.d = map.getDataAt(x, y);
					
					var idx = (y * map.width) + x;
					
					// Empty
					if (map.d == 0) {
						display.print(4 + (x-map.offsetX) * 2, 5 + (y-map.offsetY), '.', {'fg': 8});
					}
					// Forest
					else if (map.d == 1) {
						display.print(4 + (x-map.offsetX) * 2, 5 + (y-map.offsetY), String.fromCharCode('9650'), {'fg': 2});
					}
					// Water
					else if (map.d == 2) {
						display.print(4 + (x-map.offsetX) * 2, 5 + (y-map.offsetY), String.fromCharCode('8773'), {'fg': 1}); // 8718
					}
					
					if (map.selectionType == 'tile') {
						if (map.selectionIndex == idx) {
							map.selectedTileCoords.push({'x': x, 'y': y});
							highlightedX = x;
							highlightedY = y;
						}
					} else if (map.selectionType == 'building') {
						var b = map.buildings[map.selectionOwner][map.selectionIndex];
						if (b == null || b == undefined) {
							map.selectionType = 'none';
							map.selectionIndex = -1;
							map.selectionOwner = -1;
							continue;
						}
						if (b.x == x && b.y == y) {
							map.selectedTileCoords.push({'x': x, 'y': y});
							highlightedX = x;
							highlightedY = y;
						}
					} else if (map.selectionType == 'unit') {
						var u = map.units[map.selectionOwner][map.selectionIndex];
						if (u == null || u == undefined) {
							/*map.selectionType = 'none';
							map.selectionIndex = -1;
							map.selectionOwner = -1;*/
							continue;
						}
						if (u.x == x && u.y == y) {
							highlightedX = x;
							highlightedY = y;
						}
					}
				}
			}
			
			for (var y = 0; y < 14; y++) {
				display.print(1, 5 + y, ((y+1+map.offsetY) < 10 ? ' '+(y+1+map.offsetY) : (y+1+map.offsetY).toString()), {'fg': (highlightedY == y+map.offsetY ? 13 : 15)});
			}
			
			for (var x = 0; x < 19; x++) {
				display.print(4 + x*2, 4, map.characters[map.offsetX+x], {'fg': (highlightedX == x+map.offsetX ? 13 : 15)});
			}
			
			
			this.drawBuildings();
			this.drawUnits();
		},
		
		drawUnits: function()
		{
			if (views.inGame.segment != 0 || game.currentGameSessionActive == false || game.currentGameSessionId == null) {
				return;
			}
			
			var specials = [];
			
			for (var y = map.offsetY; y < (map.offsetY + 14); y++)
			{
				for (var x = map.offsetX; x < (map.offsetX + 19); x++)
				{
					if (map.isDiscovered(x, y) == false) {
						continue;
					}
					
					var unitsOnTile = this.allUnitsAtCoord(x, y);
					
					if (unitsOnTile.length == 0) {
						continue;	
					}
					
					for (var i = 0; i < unitsOnTile.length; ++i)
					{
						var u = unitsOnTile[i].unit;
						
						if (u.blink) {
							if (u.blink == 1) {
								specials.push({'x': u.x, 'y': u.y, 'icon': '*', 'color': 15});
							} else if (u.blink == 2) {
								specials.push({'x': u.x, 'y': u.y, 'icon': '+', 'color': 12});
							}
						}
						
						if (u.selected && map.isCoordSelected(u.x, u.y) == false) {
							map.selectedTileCoords.push({'x': u.x, 'y': u.y});
						}
					}
					
					display.clearRect(4 + (x - map.offsetX) * 2 - 1, 5 + (y - map.offsetY), 3, 1);

					var idx = this.unitCycleCounter % unitsOnTile.length;
					var playerUnitsOnTile = map.unitsAtCoord(x, y);
					var res = unitsOnTile[idx];
					var unit = res.unit;
					
					var unitIcon = '#';
					var bgColor = 0;
					var colorIndex = ((res.client != client.index) ? 4 : 6);
					

					
					if (unit.type == 0) unitIcon = String.fromCharCode(4040); //'|';
					else if (unit.type == 1) unitIcon = String.fromCharCode(4025);
					else if (unit.type == 2) unitIcon = 'Φ';
					else if (unit.type == 3) unitIcon = 'Ø';
					else if (unit.type == 4) unitIcon = String.fromCharCode(3859);
					else if (unit.type == 5) unitIcon = String.fromCharCode(9769); // 9882 5776
					else if (unit.type == 6) unitIcon = String.fromCharCode(8965);
					else if (unit.type == 7) unitIcon = String.fromCharCode(9674); // Mobbile Radar Beacon

					if (unit.fortify.state == true) {
						bgColor = 8;
					}
					
					display.print(4 + (unit.x - map.offsetX) * 2, 5 + (unit.y - map.offsetY), unitIcon, {fg:colorIndex, bg:bgColor});
				}
			}

			for (var i=0; i < specials.length;i++) {
				display.print(4 + (specials[i].x - map.offsetX) * 2, 5 + (specials[i].y - map.offsetY), specials[i].icon, {'fg': specials[i].color});
			}
			
			if (this.unitCycleTimeout) {
				clearTimeout(this.unitCycleTimeout);	
			}
			
			this.unitCycleTimeout = setTimeout("map.drawUnits()", 1000);
			
			this.unitCycleCounter ++;
			if (this.unitCycleCounter >= 1000) { 
				this.unitCycleCounter = 0;
			}
			
			for (var i = 0; i < map.selectedTileCoords.length; ++i)
			{
				display.print(4 + (map.selectedTileCoords[i].x - map.offsetX) * 2 - 1, 5 + (map.selectedTileCoords[i].y - map.offsetY), '[', {'fg': 14});
				display.print(4 + (map.selectedTileCoords[i].x - map.offsetX) * 2 + 1, 5 + (map.selectedTileCoords[i].y - map.offsetY), ']', {'fg': 14});
			}
		},
		
		drawBuildings: function() {
			
			var specials = [];
			
			for (var i=0;i<game.maxPlayers;i++)
			{
				if (!map.buildings[i]) {
					continue;
				}
				
				for (var bi=0;bi<map.buildings[i].length;bi++)
				{
					var b = map.buildings[i][bi];
					
					if (i != client.index && map.isDiscovered(b.x, b.y) == false) {
						continue;
					}
					
					// in bounds of map
					if (b.x >= map.offsetX && b.x < map.offsetX + 19 &&
						b.y >= map.offsetY && b.y < map.offsetY + 14) {
						
						var bIcon = '#';
						var colorIndex = ((b.time == 0 || !b.time) ? 14 : 7);
						var bgColorIndex = 0;
						
						if (i != client.index) {
							colorIndex = 4;
						}
						
						if (b.blink) {
							if (b.blink == 1) {
								specials.push({'x': b.x, 'y': b.y, 'icon': '*', 'color': 15});
							} else if (b.blink == 2) {
								specials.push({'x': b.x, 'y': b.y, 'icon': '+', 'color': 7});
							}
						}
						
							 if (b.type == 0) { bIcon = 'C'; }
						else if (b.type == 1) { bIcon = 'P'; if (colorIndex == 14) { colorIndex = 9; } }
						else if (b.type == 2) { bIcon = 'B'; if (colorIndex == 14) { colorIndex = 3; } }
						else if (b.type == 3) { bIcon = 'F'; if (colorIndex == 14) { colorIndex = 3; } }
						else if (b.type == 4) { bIcon = 'L'; if (colorIndex == 14) { colorIndex = 11; } }
						else if (b.type == 5) { bIcon = 'D'; if (colorIndex == 14) { colorIndex = 6; } }
						else if (b.type == 6) { bIcon = /*'•'*/ String.fromCharCode(3663); if (colorIndex == 14) { colorIndex = 5; } }
						else if (b.type == 7) { bIcon = 'H'; if (colorIndex == 14) { colorIndex = 12; /*bgColorIndex = 4;*/ } }
						else if (b.type == 8) { bIcon = 'G'; if (colorIndex == 14) { colorIndex = 7; /*bgColorIndex = 8;*/ } }
						
						if ((b.type == 2 || b.type == 3) &&
							b.spawnpoint &&
							(!b.time || b.time == 0) &&
							i == client.index &&
							bi == map.selectionIndex &&
							map.selectionType == 'building')
						{
							var spwnGfx = '*';
							var dx = (b.x - b.spawnpoint.x);
							var dy = (b.y - b.spawnpoint.y);
							
							if (dx == 0 && (dy < 0 || dy > 0)) { spwnGfx = String.fromCharCode(8942); }
							else if (dy == 0 && (dx < 0 || dx > 0)) { spwnGfx = String.fromCharCode(8943); }
							else if (dy < 0 && dx < 0) { spwnGfx = String.fromCharCode(8945); }
							else if (dy < 0 && dx > 0) { spwnGfx = String.fromCharCode(8944); }
							else if (dy > 0 && dx < 0) { spwnGfx = String.fromCharCode(8944); }
							else if (dy > 0 && dx > 0) { spwnGfx = String.fromCharCode(8945); }
														
							specials.push({'x': b.spawnpoint.x, 'y': b.spawnpoint.y, 'icon': spwnGfx});
						}
						
						display.print(4 + (b.x - map.offsetX) * 2, 5 + (b.y - map.offsetY), bIcon, {fg:colorIndex, bg:bgColorIndex});
					}
				}
			}
			
			for(var i=0;i<specials.length;i++) {
				display.print(4 + (specials[i].x - map.offsetX) * 2, 5 + (specials[i].y - map.offsetY), specials[i].icon, {fg:specials[i].color});
			}
		},
		
		centerOn: function(x, y) {
			map.offsetX = Math.min(Math.max(x - 10, 0), map.width - 19);
			map.offsetY = Math.min(Math.max(y - 8, 0), map.height - 14);
		},
		
		initUnits: function(clientIndex)
		{
			/*for(var i=0; i < map.units[clientIndex].length; ++i) {
				var u = map.units[clientIndex][i];
				map.discover(u.x, u.y, 3);
			}*/
		},
		
		initBuildings: function(clientIndex)
		{
			for(var i=0; i < map.buildings[clientIndex].length; ++i)
			{
				var b = map.buildings[clientIndex][i];
				
				// Barracks
				if (b.type == 2 || b.type == 3) {
					if (!b.spawnpoint) {
						b.spawnpoint = map.spawnPointAroundPoint(b.x, b.y);
					}
				}
			}
		},
		
		resetVisibility: function()
		{
			map.discovered = [map.data.length];
			
			for(var i = 0; i < map.data.length; ++i) {
				map.discovered[i] = false;
			}
		},
		
		discover: function(x, y, radius, skipTrees)
		{
			for (var angle = 0; angle < 360; angle += 10)
			{
				for (var r = 0; r <= radius; ++r)
				{
					var _x = Math.round(x + Math.sin(angle*(3.14159265/180.0)) * r);
					var _y = Math.round(y + Math.cos(angle*(3.14159265/180.0)) * r);
					
					if (_x < 0 || _x >= map.width || _y < 0 || _y >= map.height) {
						break;
					}
					
					// Trees block visibility
					if (skipTrees == false && map.getDataAt(_x, _y) == 1) {
						map.discovered[(_y * map.width) + _x] = true;
						break;
					}

					// Already discovered
					if (map.discovered[(_y * map.width) + _x]) {
						continue;
					}
					
					map.discovered[(_y * map.width) + _x] = true;
				}
			}
			
			// map.display();
		},
		
		isCoordVisible: function(x, y)
		{
			if (x >= map.offsetX &&
				x < (map.offsetX + 19) &&
				y >= map.offsetY &&
				y < (map.offsetY + 14)) {
				return true;
			} else {
				return false;
			}
		},
		
		calculateVisibleAreas: function()
		{
			map.resetVisibility();
			
			for (var i = 0; i < map.buildings[client.index].length; ++i) {
				var b = map.buildings[client.index][i];
				map.discover(b.x, b.y, 4, false);
			}
			
			for (var i=0; i < map.units[client.index].length; ++i) {
				var u = map.units[client.index][i];
				if (u.type == 7) {
					map.discover(u.x, u.y, 6, true);
				} else {
					map.discover(u.x, u.y, (u.type == 4 ? 3 : 2), false); // scouts 3, others 2
				}
			}
		},
		
		centerOnHomeBase: function()
		{
			if (map.buildings[client.index].length > 0) {
				var b = map.buildings[client.index][0];
				if (b) { map.centerOn(b.x, b.y); map.display(); }
			}
		}
	}
});