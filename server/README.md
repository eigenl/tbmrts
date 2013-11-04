Text Based Multiplayer RTS Server
=================================

This is the backend part of the game. It runs on NodeJS using WebSockets.


Prerequisites
-------------

Right now the game uses two MySQL tables. You'll have to set them up on your machine beforehand.

**sessions**

	CREATE TABLE IF NOT EXISTS `sessions` (
	  `id` char(16) NOT NULL,
	  `userId` int(11) NOT NULL,
	  `ip` varchar(39) NOT NULL,
	  PRIMARY KEY (`id`)
	)

and **users**

	CREATE TABLE IF NOT EXISTS `users` (
	  `id` int(11) NOT NULL AUTO_INCREMENT,
	  `username` char(16) NOT NULL,
	  `password` char(40) NOT NULL,
	  `wins` int(11) NOT NULL DEFAULT '0',
	  `losses` int(11) NOT NULL DEFAULT '0',
	  `gamesCreated` int(11) NOT NULL DEFAULT '0',
	  `gamesJoined` int(11) NOT NULL DEFAULT '0',
	  PRIMARY KEY (`id`)
	)


How to run this
---------------

First of all I'm very green when it comes to Linux and I don't know much about it. So if your favourite distro requires anything different to run this be sure to let me know. I'm running this on Ubuntu. The dependencies are described in package.json and to install everything just run

	npm install
	
More on `NPM` [here][1].
[1]: http://howtonode.org/introduction-to-npm/ "HowToNode.org"

To start the server application type

	node start app.js


Optionally you may install `forever` to run the server application in the background and have it restart automatically on crash.

	npm install forever
	forever start app.js
