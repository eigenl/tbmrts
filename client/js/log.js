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
	log = {
	
		// Render the log
		display: function()
		{
			if (log.visible == false) {
				return;
			}
			
			var endIndex = log.messages.length;
			var startIndex = Math.max(endIndex - 7, 0);
			
			display.clearRect(1,20,78,7);
			
			for (var i = startIndex; i < endIndex; ++i) {
				display.print(2, 20 + (i-startIndex), log.messages[i].text, {'fg': log.messages[i].color});
			}
		},
	
		// Insert line of text with color
		insert: function(message, color)
		{
			// Limit message length to 76 characters
			if (message.length > 76) {
				message = message.substring(0, 76);
			}
			log.messages.push({'text': message, 'color': color});
			log.display();
		},
		
		// Clea all log messages
		clear: function()
		{
			log.messages = [];
			log.display();
			views.showMore = 0;
		},
	
		messages: [],
		visible: true
	}
});