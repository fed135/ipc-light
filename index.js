/**
 * Main
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

var Client = require('./src/Client');
var Server = require('./src/Server');
var defaults = require('./src/defaults');

/* Exports -------------------------------------------------------------------*/

module.exports = {
	/**
	 * Helper function to create an IPC server
	 */
	createServer: function(requestHandler) {
		var server = new Server();
		server.handler = requestHandler;
		return server;
	},
	/**
	 * Helper function to create a client and listen to a server
	 */ 
	connect: function(config, callback) {
		var client = new Client(config);
		client.connect(callback);
		return client;
	},
	Client: Client,
	Server: Server,
	defaults: defaults
};