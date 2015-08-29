/**
 * Benchmarks to compare the speeds of http server, vs tcp socket vs udp socket
 * vs ipc socket.
 */

/* Requires ------------------------------------------------------------------*/

var ipc = require('../index');
var http = require('http');
var dgram = require('dgram');
var net = require('net');

/* Local variables -----------------------------------------------------------*/

var times = {};
var servers = {};

/* Methods -------------------------------------------------------------------*/

// Imported `all` method from Kalm 
function all(list, callback) {
	function _promisify(method) {
		return new Promise(method);
	}	

	Promise.all(list.map(_promisify)).then(function() {
		callback();
	},
	function(err) {
		callback(err || 'unhandled_error');
		cl.error('Boot failure: ');
		cl.error(err);
	});
}

function _startServers() {
	servers.http = http.createServer(function(request, response) {
		//console.log('hi there !');
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.end('test');
	});
	servers.http.listen(6080);

	servers.ipc = ipc.createServer(function(request, reply) {
		reply('test');
	}).listen();

	servers.udp = dgram.createSocket('udp4');
	servers.udp.on('message', function (message, remote) {
    //reply
    //console.log(remote);
    _udp(function(){}, remote.port);
  });
  servers.udp.bind(33333, '127.0.0.1');

  servers.tcp = net.createServer(function(socket){
  	socket.end('test');
  });
  servers.tcp.listen(3080);
}

function _runTest(type, callback) {
	var _currTime = Date.now();
	type.method(function(){
		var result = Date.now() - _currTime;
		if (!times[type.name]) times[type.name] = {
			min: null,
			max: null
		};
		if (times[type.name].min == null || 
			times[type.name].min > result) times[type.name].min = result;
		if (times[type.name].max == null || 
			times[type.name].max < result) times[type.name].max = result;
	});
}

function _ipc(callback) {
	var client = ipc.connect();
	client.ondata.add(function() {
		client.disconnect();
		callback()
	});
	client.emit('test');
}

function _http(callback){
	var req = http.request('http://localhost:6080', callback);
	req.write('test');
	req.end();
}

function _udp(callback, port){
	var client = dgram.createSocket('udp4');
	var message = new Buffer('test');
	client.send(message, 0, message.length, port || 33333, '127.0.0.1', function(err, bytes) {
    if (err) {
    	client.close();
    	//throw err;
    }
	});

	client.on('message', function(){
		callback();
    client.close();
	});
}

function _tcp(callback) {
	var client = net.connect(3080);
	client.write('test');
	client.on('data', function(){
		client.end();
		callback();
	});
}

function _teardown() {
	Object.keys(servers).forEach(function(e) {
		if (servers[e].destroy) servers[e].destroy();

		if (servers[e].close) servers[e].close();
		else console.log('server ' + e + ' has no close method.');
	});
}

/* Entry point ---------------------------------------------------------------*/

var hardBreak = false;
_startServers();
setTimeout(function() {
	for(var i = 0; i<1000; i++) {
		if (hardBreak) return;
		_runTest({
			name: 'ipc',
			method: _ipc
		});
		_runTest({
			name: 'http',
			method: _http
		});
		_runTest({
			name: 'udp',
			method: _udp
		});
		_runTest({
			name: 'tcp',
			method: _tcp
		})
	}
}, 1000);
setTimeout(function() {
	hardBreak = true;
	console.log(times);
	_teardown();
},10000);