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
	display = {
		
		init: function()
		{
			var foo = document.getElementById("canvas_display");
			display.canvas = document.createElement('canvas');

			display.canvas.setAttribute("width", display.canvasWidth);
			display.canvas.setAttribute("height", display.canvasHeight);
			display.canvas.setAttribute("id", "editor");
			
			foo.appendChild(display.canvas);

			if (typeof G_vmlCanvasManager != 'undefined') {
				display.canvas = G_vmlCanvasManager.initElement(display.canvas);
			}	
			
			display.context = display.canvas.getContext("2d");
			display.context.textAlign = 'center';
			display.context.textBaseline = 'middle';
			display.context.font = display.font;
						
			$(document).bind("keydown keypress", function (e)
			{
				/*
					For disabling backspace from going back in browsing history.
				*/
				
				var preventKeyPress;
				
				var rx = /INPUT|TEXTAREA/i;
				var rxT = /RADIO|CHECKBOX|SUBMIT/i;
				
				if (e.keyCode == 27) {
					e.preventDefault();
				}
				
				if (e.keyCode == 8) {
					var d = e.srcElement || e.target;
					if (rx.test(e.target.tagName)) {
						var preventPressBasedOnType = false;
						if (d.attributes["type"]) {
							preventPressBasedOnType = rxT.test(d.attributes["type"].value);
						}
						preventKeyPress = d.readOnly || d.disabled || preventPressBasedOnType;
					} else {preventKeyPress = true;}
				} else { preventKeyPress = false; }
							
				if (preventKeyPress) e.preventDefault();			
			});
			
			$(document).bind('keyup', function(e)
			{
				// Enter key
				if(e.keyCode == 13)
				{
					if (display.onInput) {
						display.onInput(display.prompt.input.toLowerCase());
					}
					
					display.reloadPrompt();
				}
			});
			
			$(document).bind('keydown', function(e)
			{
				// Backspace
				if (e.keyCode == 8)
				{
					if (display.prompt.input.length > 0)
					{
						display.prompt.input = display.prompt.input.slice(0, -1);
						display.prompt.carriagePosition -= 1;
						display.refreshPrompt();
					}
				}
				// Up arrow
				else if (e.keyCode == 38)
				{
					if (display.inputHistoryIndex == 0) {
						display.prompt.storedInput = display.prompt.input;
					}

					if (display.inputHistoryIndex < Math.min(10, display.inputHistory.length))
					{
						display.inputHistoryIndex ++;
						display.prompt.input = display.inputHistory[display.inputHistoryIndex-1];
						display.prompt.carriagePosition = display.prompt.input.length;
						display.refreshPrompt();
					}
				}
				// Down arrow
				else if (e.keyCode == 40)
				{
					if (display.inputHistoryIndex > 0)
					{
						display.inputHistoryIndex --;
						
						if (display.inputHistoryIndex == 0) {
							display.prompt.input = display.prompt.storedInput;
						} else {
							display.prompt.input = display.inputHistory[display.inputHistoryIndex-1];
						}
						display.prompt.carriagePosition = display.prompt.input.length;
						display.refreshPrompt();
					}
				}
				// Space key
				else if (e.keyCode == 32)
				{
					display.prompt.carriagePosition += 1;
					display.prompt.input = display.prompt.input.insert(display.prompt.carriagePosition, ' ');
					display.refreshPrompt();
				}
				else
				{
					var k = String.fromCharCode(e.keyCode).toLowerCase();
			
					var allowedCharacters = ' abcdefghijklmnopqrstuvwxyz0123456789';
						
					if(allowedCharacters.indexOf(k) != -1 && display.prompt.input.length < 70)
					{
						display.prompt.carriagePosition += 1;
						display.prompt.input = display.prompt.input.insert(display.prompt.carriagePosition, k);
						display.refreshPrompt();
					}
				}
			});
			
			setTimeout('display.togglePromptCarriageBlink()', 500);
		
			this.reloadPrompt();
		},
		
		fillRow: function(row, columnFrom, columnTo, character, options)
		{
			var bg = ((options && options.bg != null) ? options.bg : 0);
			var fg = ((options && options.fg != null) ? options.fg : 15);
			
			for (var i = columnFrom; i < columnTo; i++) {
				var pos = display.posForChar(i, row);
				display.setColors(pos, bg, fg);
				if (character != ' ') {
					display.context.fillText(character, pos.x + display.glyphSize.x/2, pos.y + display.glyphSize.y/2);
				}
			}
		},

		clearRow: function(row) {
			display.context.clearRect(0, row * display.glyphSize.y, display.canvasWidth, display.glyphSize.y);
		},
		
		clear: function() {
			display.context.clearRect(0, 0, display.canvasWidth, display.canvasHeight);
			display.refreshPrompt();
		},
		
		clearRect: function(x, y, w, h) {
			display.context.clearRect(x * display.glyphSize.x, y * display.glyphSize.y, w * display.glyphSize.x, h * display.glyphSize.y);
		},
		
		fillRect: function(x, y, w, h, colorIndex) {
			display.context.fillStyle = display.colors[colorIndex];
			display.context.fillRect(x * display.glyphSize.x, y * display.glyphSize.y, w * display.glyphSize.x, h * display.glyphSize.y);
		},
		
		posForChar: function(x, y) {
			return {x: (x * display.glyphSize.x), y: (y * display.glyphSize.y)};
		},
		
		setColors: function(pos, bg, fg) {
			if (bg == 0)
			{
				display.context.clearRect(pos.x, pos.y, display.glyphSize.x, display.glyphSize.y);
			}
			else
			{
				display.context.fillStyle = display.colors[bg];
				display.context.fillRect(pos.x, pos.y, display.glyphSize.x, display.glyphSize.y);
			}
					
			display.context.fillStyle = display.colors[fg];
		},
	
		print: function(x, y, text, options)
		{
			// options
			var bg = ((options && options.bg != null) ? options.bg : 0);
			var fg = ((options && options.fg != null) ? options.fg : 15);
			var fillToEnd = (options && options.fillToEnd != null ? options.fillToEnd : false); // extend line with emtpy characters
			var lengthToFill = (options && options.fill != null ? options.fill : 0);
			var maxLength = (options && options.maxLength != null ? (x + options.maxLength) : display.cols);
			var wrapText = (options && options.wrapText != null ? options.wrap : false);

			text = text.replaceAll('  ', '__');
			text = text.replaceAll('_ ', '__');
			
			
			var words = text.split(' ');
			
			if (words.length > text.length) {
				words = words.slice(0, -1);
			}

			var col = x;
			var row = y;
			
			for (var w = 0; w < words.length; w++)
			{
				var word = words[w];
				var n = word.length;
				
				if (n == 0) { 
					var pos = display.posForChar(col, row);
					display.setColors(pos, bg, fg);
					col ++;
					continue;
				}
				
				if ((col + n - 1) >= maxLength) {
					if (wrapText == false) {
						display.fillRow(row, col, maxLength, ' ', options);
					}
					col = x;
					row ++;
				}				
				
				for (var i = 0; i <= n; i++)
				{
					var pos = display.posForChar(col, row);
					var c = (i == n) ? ' ' : word.charAt(i);
					
					if (c == '_') { c = ' '; }
					
					if (c == ' ') {
						if (i == n && (col == x || w == words.length-1 || (w < words.length -1 && words[w+1].length == 0 && (w+1) == words.length-1) || col == maxLength)) {
							break;
						} else {
							c = ' ';
						}
					}
					
					display.setColors(pos, bg, fg);
					
					if (c != ' ') {
						display.context.fillText(c, pos.x + display.glyphSize.x/2, pos.y + display.glyphSize.y/2);
					}
					
					col ++;
					
					if (col >= display.cols) { 
						col = x;
						row ++;
					}
				}
			}
			
			var fillEndColumn = Math.max((fillToEnd == true ? this.cols : 0), col + lengthToFill);

			// Fill requested space
			if (col < fillEndColumn) {
				display.fillRow(row, col, fillEndColumn, ' ', options);
			}
	
			return {h: (row + 1 - y)};
		},
		
		showPrompt: function()
		{
			display.prompt.visible = true;
			display.refreshPrompt();
		},
		
		hidePrompt: function()
		{
			display.prompt.visible = false;
			display.refreshPrompt();
		},
		
		reloadPrompt: function()
		{
			display.prompt.carriagePosition = 0;
			display.prompt.input = ''; 
			
			display.refreshPrompt();
		},
		
		refreshPrompt: function()
		{
			display.context.clearRect(0, 28 * display.glyphSize.y, display.canvasWidth, display.glyphSize.y);
			
			if (display.prompt.visible)
			{
				var inputText = (display.prompt.text + display.prompt.input).toUpperCase();
				
				if (display.prompt.carriageVisible) {
					inputText = inputText.insert(display.prompt.text.length + display.prompt.carriagePosition, String.fromCharCode(8718));
				}
				
				display.context.fillStyle = display.colors[15];
				
				for (var i = 0; i < inputText.length; i++)
				{
					var pos = display.posForChar(i, 28);
					display.context.fillText(inputText.charAt(i), pos.x + display.glyphSize.x/2, pos.y + display.glyphSize.y/2);
				}
			}
		},
		
		togglePromptCarriageBlink: function() {
			//display.prompt.carriageVisible = !display.prompt.carriageVisible;
			//display.refreshPrompt();
			//setTimeout('display.togglePromptCarriageBlink()', 500);
		},
		
		cols: 80,
		prompt: {
			text: '> ',
			carriagePosition: 0,
			input: '',
			storedInput: '',
			visible: false,
			carriageVisible: true
		},
		
		// Playing around with glyph height you can fit more rows on screen
		glyphSize: {x: 8, y: 16},
		font: '14px "Courier New", Courier, monospace',
		canvas: null,
		context: null,
		canvasWidth: 640,
		canvasHeight: 464, // 16 px * 29 rows
		inputHistory: [],
		inputHistoryIndex: 0,
		onInput: null,
		colors: ['inherit','#1D438F','#40A133','#0FA9A7','#B31D1D','#AD15B3','#A85400','#B2B2B2','#575655','#6298D4','#8DEA70','#99F7F6','#FC5454','#F46EF2','#EDE55D','#F1EFED', '#151413']
		
	}
});