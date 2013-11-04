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
	/*
		TODO: Having this logic on client-side is *really* not wise ..
	*/
	
	client =
	{
		
		/*
			What can I build?
		*/
		getConstructionOptions: function()
		{
			var options = [];
			
			// Power plant
			options.push(1);
			
			// Supply depot
			options.push(5);
			
			// Has power plant - can build barracks and turrets
			if (map.hasBuildingType(client.index, 1)){
				options.push(2);
				options.push(6);
			}
				
			// Has power plant and supply depot - can build factory
			if (map.hasBuildingType(client.index, 1) && map.hasBuildingType(client.index, 5)) {
				options.push(3);
			}
			
			// Has barracks and factory - can build lab
			if (map.hasBuildingType(client.index, 2) && map.hasBuildingType(client.index, 3))
			{
				options.push(4);
			}
			
			// Has barracks - can build field hosptial
			if (map.hasBuildingType(client.index, 2)) {
				options.push(7);
			}
			
			// Has factory - can build garage
			if (map.hasBuildingType(client.index, 3)) {
				options.push(8);
			}
			
			return options;
		},
		
		/*
			Who can I train?
		*/
		getTrainingOptions: function()
		{
			var options = [];
			
			// Scout
			options.push(4);
			
			// Trooper
			options.push(0);
			
			// Heavy trooper
			if (this.upgrades['building'][2] == true) {
				options.push(1);
			}
			
			// Has a field hosptial - Medic
			if (map.hasBuildingType(client.index, 7)) {
				options.push(5);
			}
			
			// Has a garage - Engineer
			if (map.hasBuildingType(client.index, 8)) {
				options.push(6);
			}
			
			return options;
		},
		
		
		/*
			What vehicles can I build?
		*/
		
		getFactoryBuildOptions: function()
		{
			var options = [];
			
			// Light tank
			options.push(2);

			// Factory upgraded > Heavy tank & MRB
			if (this.upgrades['building'][3] == true) {
				options.push(3);
				options.push(7);
			}
			
			return options;
		},
		
		/*
			What buildings can I upgrade?
		*/
		
		getBuildingUpgradeOptions: function()
		{
			var options = [];
			
			// Command center
			if (this.upgrades['building'][0] == false) {
				options.push(0);
			}
				
			// Supply depot
			if (this.upgrades['building'][5] == false) {
				options.push(5);
			}
			
			// Powerplant
			if (this.upgrades['building'][1] == false) {
				// options.push(1);
			}
			
			// Barracks
			if (this.upgrades['building'][2] == false) {
				options.push(2);
			}
			
			// Factory
			if (this.upgrades['building'][3] == false) {
				options.push(3);
			}
			
			return options;
		},
		
		resources: 0,
		upgrades: null,
		index: 0,
		authenticated: false
	}
});