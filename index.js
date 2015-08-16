var Client = require('./src/Client');
var Server = require('./src/Server');

module.exports = {
	createServer: function(requestHandler) {
		var server = new Server();
		server.handler = requestHandler;
		return server;
	},
	connect: function(config, callback) {
		var client = new Client(config);
		client.connect(callback);
		return client;
	}
};