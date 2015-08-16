/**
 * IPC Client class
 * @class Client
 */

/* Requires ------------------------------------------------------------------*/

var defaults = require('./defaults');

var net = require('net');
var Signal = require('signal');
var debug = require('debug')('ipc');

/* Methods -------------------------------------------------------------------*/

/**
 * Client class constructor
 * @constructor
 * @params {Object} config The configuration object for the client
 */
function Client(config) {
	this.path = config.path || defaults.path;
	this.socket;

	this.onconnect = new Signal();
	this.ondisconnect = new Signal();
	this.ondata = new Signal();
}

Client.prototype.emit = function(payload) {
	if (!this.socket) {
		debug('error: client is not connected');
		return false;
	}

	this.socket.emit(defaults.evt, payload);
};

/**
 * Connects the client to an IPC server
 * @method connect
 * @memberof Client
 */
Client.prototype.connect = function() {
	debug('log: trying to connect to ' + this.path);

	this.socket = net.connect({
		path: this.path
	});

	this.socket.on('close', this._handleDisconnect.bind(this));

	this.socket.on('error', this._handleError.bind(this));

	this.socket.on(defaults.evt, this.ondata.dispatch);

	debug('log: client connected');
	this.onconnect.dispatch(this);
};

/**
 * Disconnects the client to an IPC server
 * @method disconnect
 * @memberof Client
 */
Client.prototype.disconnect = function() {
	debug('warning: disconnecting client');

	this.socket.destroy();
	this.ondisconnect.dispatch(this);
};

/**
 * Handles socket disconnection
 * @private
 * @method _handleDisconnect
 * @memberof Client
 */
Client.prototype._handleDisconnect = function() {
	debug('warning: client has been disconnected');

	this.socket.destroy();
	this.ondisconnect.dispatch(this);
};

/**
 * Handles socket errors
 * @private
 * @method _handleError
 * @memberof Client
 * @params {Error} error The error object
 */
Client.prototype._handleError = function(error) {
	debug('error: socket error [' + error + ']');
};

/* Exports -------------------------------------------------------------------*/

module.exports = Client;