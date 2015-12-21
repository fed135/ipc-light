/**
 * IPC Server class
 * @class Server
 */

'use strict';

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

		return this.close.call(this, function reconnect() {
			_self.listen.call(_self, path, callback);
		});
	}

	this.path = path || defaults.path;
	if (!path) {
		debug('log: no path provided, default path used: ' + defaults.path);
	}

	debug('log: unlinking server path...');
	fs.unlink(this.path, function bindSocket() {

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
	// Can now send a Buffer or a plain string, no added steps
	if (!(payload instanceof Buffer) && !(payload instanceof String)) {
		payload = JSON.stringify(payload);
	} 

	this.sockets.forEach(function writeToAll(e) {
		this.write(e, payload);
	}, this);

	return this;
};

/**
 * Makes the server broadcast a message to all connected sockets
 * @method broadcast
 * @memberof Server
 * @param {Socket} socket The socket to write to
 * @param {?} payload The payload to send to the socket
 * @returns {Server} Self reference, for chaining
 */
Server.prototype.write = function(socket, payload) {
	// Can now send a Buffer or a plain string, no added steps
	if (!(payload instanceof Buffer) && !(payload instanceof String)) {
		payload = JSON.stringify(payload);
	} 

	if (socket && socket.write) socket.write(payload);
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
	fs.unlink(this.path, function unlink() {
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
	
	//Remove socket from list
	this.sockets = this.sockets.filter(function(e) {
		return e !== socket;
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
		error: error,
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

	socket.on('close', function _socketClose() {
		_self._handleDisconnect.call(_self, socket);
	});

	socket.on('error', function _socketError(err) {
		_self._handleError.call(_self, socket, err);
	});

	socket.on(defaults.evt, function _socketData(payload) {
		debug('received data');
		_self.handler(payload, function _socketHandler(msg) {
			_self.write.call(_self, socket, msg);
		});
	});

	_self.onconnect.dispatch(socket);
};

/* Exports -------------------------------------------------------------------*/

module.exports = Server;