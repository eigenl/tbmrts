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

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

inputFromParameter = function(inputComponents, paramIndex)
{
	var out = '';
	
	for (var i = paramIndex; i < inputComponents.length; i++) {
		out += inputComponents[i];
		if (i < inputComponents.length-1) {
			out += ' ';
		}
	}
	
	return out;
}

inputFromToParameter = function(inputComponents, paramIndexFrom, paramIndexTo)
{
	if (paramIndexFrom == paramIndexTo) {
		return inputComponents[paramIndexFrom];
	}
	
	var out = '';
	
	for (var i = paramIndexFrom; i < paramIndexTo; i++) {
		out += inputComponents[i];
		if (i < paramIndexTo-1) {
			out += ' ';
		}
	}
	
	return out;
}

coordsFromString = function(str)
{
	var col = map.alphaToIndex(str.charAt(0).toUpperCase());
	var row = parseInt(str.substr(1, str.length), 10) - 1;
	return {'x': col, 'y': row};
}

buildingTypeFromName = function(name) {
		 if (name == 'command center') 	return 0;
	else if (name == 'power plant') 	return 1;
	else if (name == 'barracks') 		return 2;
	else if (name == 'factory') 		return 3;
	else if (name == 'lab') 			return 4;
	else if (name == 'supply depot') 	return 5;
	else if (name == 'turret') 			return 6;
	else if (name == 'field hospital') 	return 7;
	else if (name == 'garage') 			return 8;
	return -1;
}

buildingNameForType = function(type) {
		 if (type == 0) return 'COMMAND CENTER';
	else if (type == 1) return 'POWER PLANT';
	else if (type == 2) return 'BARRACKS';
	else if (type == 3) return 'FACTORY';
	else if (type == 4) return 'LAB';
	else if (type == 5) return 'SUPPLY DEPOT';
	else if (type == 6) return 'TURRET';
	else if (type == 7) return 'FIELD HOSPITAL';
	else if (type == 8) return 'GARAGE';
	return '';
}

unitTypeFromName = function(name) {
	if (name == 'trooper') return 0;
	else if (name == 'heavy trooper') return 1;
	else if (name == 'light tank') return 2;
	else if (name == 'heavy tank') return 3;
	else if (name == 'scout') return 4;
	else if (name == 'field medic') return 5;
	else if (name == 'engineer') return 6;
	else if (name == 'mrb') return 7;
	return -1;
}

unitNameForType = function(type) {
	if (type == 0) return 'TROOPER';
	else if (type == 1) return 'HEAVY TROOPER';
	else if (type == 2) return 'LIGHT TANK';
	else if (type == 3) return 'HEAVY TANK';
	else if (type == 4) return 'SCOUT';
	else if (type == 5) return 'FIELD MEDIC';
	else if (type == 6) return 'ENGINEER';
	else if (type == 7) return 'MRB';
	return '';
}