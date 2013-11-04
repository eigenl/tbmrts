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
	lobby = {
	
		nextPage: function()
		{
			var pageSize = 10;
			var pages = Math.ceil(lobby.gameSessions.length / (pageSize * 2));
			
			if (lobby.page+1 < pages)
			{
				lobby.page += 1;
				lobby.displayList();
			}		
		},
		
		prevPage: function()
		{
			if (lobby.page > 0)
			{
				lobby.page -= 1;
				lobby.displayList();
			}
		},
	
		displayList: function()
		{
			display.clearRect(1, 4, 78, 12);
			
			if (lobby.gameSessions.length > 0)
			{
				display.print(2, 4, '#', {'bg': 0, 'fg': 11});
				display.print(5, 4, 'Name', {'bg': 0, 'fg': 11});
				display.print(28, 4, 'Size', {'bg': 0, 'fg': 11});
				display.print(24, 4, 'Pwd', {'bg': 0, 'fg': 11});
				display.print(34, 4, 'Map', {'bg': 0, 'fg': 11});
				
				var y = 6;
				var x = 1;
				var pageSize = 10;
				var pages = Math.ceil(lobby.gameSessions.length / (pageSize * 2));
			
				var start = lobby.page * pageSize*2;
				var end = start + pageSize * 2;
				
				if (end > lobby.gameSessions.length) {
					end = lobby.gameSessions.length;
				}
				
				// There are more pages
				if (lobby.gameSessions.length > end) {
					display.print(44, 18, 'Next ►', {fg: 9});
				} else {
					display.print(44, 18, 'Next ►', {fg: 8});
				}
				
				if (lobby.page > 0) {
					display.print(30, 18, '◄ Prev', {fg: 9});
				} else {
					display.print(30, 18, '◄ Prev', {fg: 8});
				}
				
				var pageStr = (lobby.page+1)+'/'+pages;
				
				display.print(39 - (pageStr.length-1) / 2, 18, pageStr, {fg: 3});
				
				for (var i = start; i < end; i++)
				{
					var ses = lobby.gameSessions[i];
					var index = (i+1).toString();
					
					var name = ses.name;
					
					if (name.length > 20) {
						name = name.substring(0, 20);
					}
					
					display.print(x, y, (index.length < 10 ? ' ' + index : index), {'fg': 14});
					var size = display.print(x+4, y, name, {'fg': 15});
					display.print(x+27, y, ses.players.toString() + '/' + ses.maxPlayers.toString(), {'fg': 15});
					display.print(x+33, y, '25x35', {'fg': 15});
					display.print(x+25, y, ses.private == true ? String.fromCharCode(8902) : '', {'fg': 15});
						
					y += size.h;
					
					if ((i-start) == (pageSize-1))
					{	
						y = 6;
						x = 40;
						
						display.print(x+1, 4, '#', {'bg': 0, 'fg': 11});
						display.print(x+4, 4, 'Name', {'bg': 0, 'fg': 11});
						display.print(x+27, 4, 'Size', {'bg': 0, 'fg': 11});
						display.print(x+23, 4, 'Pwd', {'bg': 0, 'fg': 11});
						display.print(x+33, 4, 'Map', {'bg': 0, 'fg': 11});
					}
				}
			}
			else
			{
				display.print(32, 10, 'NO GAME ROOMS', {'fg': 12});
			}
		},
	
		gameSessions: [],
		page: 0
	}
});