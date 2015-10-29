/**
 * IPC Server class
 * @class Server
 */

'use strict'

/* Requires ------------------------------------------------------------------*/

var defaults = require('./defaults');

var fs = require('fs');
var net = require('net');
var Signal = require('signals');
var debug = require('debug')('ipc');

/* Methods -------------------------------------------------------------------*/

/**
 * Server class constructor
 * @constructor
 * @param {object} config The configuration object for the server
 */
function Server() {
	this.path = null;
	this.handler = null;
	this.sockets = [];
	this.server = null;

	//Events
	this.onconnect = new Signal();
	this.ondisconnect = new Signal();
	this.onerror = new Signal();
}

/**
 * Tells the server to start listening.
 * @method listen
 * @memberof Server
 * @param {string} path The system path to connect to
 * @returns {Server} Self reference, for chaining
 */
Server.prototype.listen = function(path, callback) {
	var _self = this;

	if (this.server) {
		debug('warning: server already listening on path: ' + this.path);

		return this.close.call(this, function() {
			_self.listen.call(_self, path, callback);
		});
	}

	this.path = path || defaults.path;
	if (!path) {
		debug('log: no path provided, default path used: ' + defaults.path);
	}

	debug('log: unlinking server path...');
	fs.unlink(this.path, function() {

		_self.server = net.createServer(_self._handleConnections.bind(_self));

		debug('log: starting server ' + _self.path);
		_self.server.listen(_self.path, callback);
	});

	return this;
};

/**
 * Makes the server broadcast a message to all connected sockets
 * @method broadcast
 * @memberof Server
 * @param {?} payload The payload to send to all connected sockets
 * @returns {Server} Self reference, for chaining
 */
Server.prototype.broadcast = function(payload) {
	this.sockets.forEach(function(e) {
		if (e.write) e.write(JSON.stringify(payload) + '\n');
	});

	return this;
};

/**
 * Shuts down the server explicitly
 * @method close
 * @memberof Server
 * @param {function} callback The callback method
 * @returns {Server} Self reference, for chaining
 */
Server.prototype.close = function(callback) {
	debug('warning: closing current server');
	this.server.close();
	this.server = null;
	fs.unlink(this.path, function() {
		//Regardless of the outcome
		if (callback) callback();
	});
	return this;
};

/**
 * Handles a socket disconnection
 * @private
 * @method _handleDisconnect
 * @memberof Server
 * @param {object} socket The socket that just disconnected
 */ 
Server.prototype._handleDisconnect = function(socket) {
	debug('log: socket disconnected');
	
	//verify
	this.sockets = this.sockets.filter(function(e) {
		return e === socket;
	});

	this.ondisconnect.dispatch(socket);
};

/**
 * Handles socket errors
 * @private
 * @method _handleError
 * @memberof Server
 * @param {object} socket The socket that just had an error
 * @param {Error} error The error object
 */
Server.prototype._handleError = function(socket, error) {
	debug('error: socket error [' + error + ']');

	this.onerror.dispatch({
		error: error
		socket: socket
	});
};

/**
 * Handles new socket connections
 * @private
 * @method _handleConnections
 * @memberof Server
 * @param {object} socket The socket that just connected
 */
Server.prototype._handleConnections = function(socket) {
	var _self = this;

	debug('log: connection received');

	this.sockets.push(socket);

	socket.on('close', function() {
		_self._handleDisconnect.call(_self, socket);
	});

	socket.on('error', function(err) {
		_self._handleError.call(_self, socket, err);
	});

	socket.on(defaults.evt, function(payload) {
		debug('received data');
		_self.handler(JSON.parse(payload.toString()), function(msg) {
			socket.write(JSON.stringify(msg) + '\n');
		});
	});

	_self.onconnect.dispatch(socket);
}

/* Exports -------------------------------------------------------------------*/

module.exports = Server;