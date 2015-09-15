/**
 * IPC Client class
 * @class Client
 */

/* Requires ------------------------------------------------------------------*/

var defaults = require('./defaults');

var net = require('net');
var Signal = require('signals');
var debug = require('debug')('ipc');

/* Methods -------------------------------------------------------------------*/

/**
 * Client class constructor
 * @constructor
 * @params {Object} config The configuration object for the client
 */
function Client(config) {
	config = config || {};
	this.path = config.path || defaults.path;
	this.socket;

	this.onconnect = new Signal();
	this.ondisconnect = new Signal();
	this.ondata = new Signal();
}

/**
 * Emits a socket to an ipc server
 * @method emit
 * @memberof Client
 * params {?} payload The payload to send to the server
 */
Client.prototype.emit = function(payload) {
	if (!this.socket) {
		debug('error: client is not connected');
		return false;
	}

	debug('writing to socket ' + this.path)
	this.socket.write(JSON.stringify(payload) + '\n');

	return this;
};

/**
 * Connects the client to an IPC server
 * @method connect
 * @memberof Client
 * @params {function} callback The callback method
 */
Client.prototype.connect = function(callback) {
	debug('log: trying to connect to ' + this.path);

	this.socket = net.connect({
		path: this.path
	});

	this.socket.on('close', this._handleDisconnect.bind(this));

	this.socket.on('error', this._handleError.bind(this));

	this.socket.on(defaults.evt, this._handleData.bind(this));

	debug('log: client connected');
	if (callback) callback(this);
	this.onconnect.dispatch(this);
};

/**
 * Parses received buffer to transform it back into an object
 * @private
 * @method _handleData
 * @memberof Client
 * @params {Buffer} data The received data
 */
Client.prototype._handleData = function(data) {
	debug('client socket got data');
	this.ondata.dispatch(JSON.parse(data.toString()));
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