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

$(function ()
{
	requests =
	{
		//
		// Request a list of game sessions from the server.
		// It's a public endpoint so a simple GET request will suffice.
		// 
		
		getGameSessions: function()
		{
			$.ajax({url: 'http://' + game.conf['ip'] + ':' + game.conf['httpPort'] + '/getGameSessions', success: function(result)
			{
				lobby.gameSessions = JSON.parse(result);
				
				// Refresh lobby list
				if (views.current == 2 && views.lobby.segment == 0) {
					views.displayMainMenu(0);
				}
			}});
		}
	}
});