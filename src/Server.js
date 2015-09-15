/**
 * IPC Server class
 * @class Server
 */

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
 * @params {Object} config The configuration object for the server
 */
function Server() {
	this.path = null;
	this.handler = null;
	this.sockets = [];
	this.server = null;

	//Events
	this.onconnect = new Signal();
	this.ondisconnect = new Signal();
}

/**
 * Tells the server to start listening.
 * @method listen
 * @memberof Server
 * @params {string} path The system path to connect to
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
 * @params {?} payload The payload to send to all connected sockets
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
 * @params {function} callback The callback method
 */
Server.prototype.close = function(callback) {
	debug('warning: closing current server');
	this.server.close();
	this.server = null;
	if (callback) callback();

	return this;
};

/**
 * Handles a socket disconnection
 * @private
 * @method _handleDisconnect
 * @memberof Server
 * @params {Object} socket The socket that just disconnected
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
 * @params {Object} socket The socket that just had an error
 * @params {Error} error The error object
 */
Server.prototype._handleError = function(socket, error) {
	debug('error: socket error [' + error + ']');
};

/**
 * Handles new socket connections
 * @private
 * @method _handleConnections
 * @memberof Server
 * @params {Object} socket The socket that just connected
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