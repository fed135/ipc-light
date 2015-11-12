/**
 * IPC Client class
 * @class Client
 */

 'use strict'

/* Requires ------------------------------------------------------------------*/

var defaults = require('./defaults');

var net = require('net');
var Signal = require('signals');
var debug = require('debug')('ipc');

/* Methods -------------------------------------------------------------------*/

/**
 * Client class constructor
 * @constructor
 * @param {object} config The configuration object for the client
 */
function Client(config) {
	config = config || {};
	this.path = config.path || defaults.path;
	this.socket;

	this.onconnect = new Signal();
	this.ondisconnect = new Signal();
	this.ondata = new Signal();
	this.onerror = new Signal();
}

/**
 * Emits a socket to an ipc server
 * @method emit
 * @memberof Client
 * param {?} payload The payload to send to the server
 * returns {Client} Self reference, for chaining
 */
Client.prototype.emit = function(payload, callback) {
	if (!this.socket) {
		debug('error: client is not connected');
		return this;
	}

	debug('log: writing to socket ' + this.path);
	this.socket.write(JSON.stringify(payload), callback);

	return this;
};

/**
 * Connects the client to an IPC server
 * @method connect
 * @memberof Client
 * @param {function} callback The callback method
 * @returns {Client} Self reference, for chaining
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
	this.onconnect.dispatch(this);
	if (callback) callback(this);

	return this;
};

/**
 * Parses received buffer to transform it back into an object
 * @private
 * @method _handleData
 * @memberof Client
 * @param {Buffer} data The received data
 */
Client.prototype._handleData = function(data) {
	debug('log: client socket got data');
	this.ondata.dispatch(JSON.parse(data.toString()));
};

/**
 * Disconnects the client to an IPC server
 * @method disconnect
 * @memberof Client
 * @returns {Client} Self reference, for chaining
 */
Client.prototype.disconnect = function() {
	debug('warning: disconnecting client');

	this.socket.destroy();
	this.socket = null;
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

	if (this.socket && this.socket.destroy) {
		this.socket.destroy();
	}
	
	this.socket = null;
	this.ondisconnect.dispatch(this);
};

/**
 * Handles socket errors
 * @private
 * @method _handleError
 * @memberof Client
 * @param {Error} error The error object
 */
Client.prototype._handleError = function(error) {
	debug('error: socket error [' + error + ']');

	this.socket.destroy();
	this.socket = null;
	this.onerror.dispatch(this);
};

/* Exports -------------------------------------------------------------------*/

module.exports = Client;