/**
 * Benchmarks to compare the speeds of http server, vs tcp socket vs udp socket
 * vs ipc socket.
 */

/* Requires ------------------------------------------------------------------*/

var ipc = require('../index');
var http = require('http');
var dgram = require('dgram');
var net = require('net');

var async = require('./libs/async');
var spinner = require('./libs/spinner');

/* Local variables -----------------------------------------------------------*/

var times = {};
var servers = {};

/* Methods -------------------------------------------------------------------*/

function _startServers(resolve) {
	spinner.setText('setup');
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

  setTimeout(resolve, 2000);
}

function _runTest(type, callback) {
	var _currTime = _microTime();
	type.method(function(){
		var result = Math.round(_microTime() - _currTime);
		if (!times[type.name]) times[type.name] = {
			min: null,
			max: null,
			_total: 0,
			calls: 0
		};
		times[type.name].calls++;
		times[type.name]._total += result;
		if (times[type.name].min == null || 
			times[type.name].min > result) times[type.name].min = result;
		if (times[type.name].max == null || 
			times[type.name].max < result) times[type.name].max = result;

		if (callback) callback();
	});
}

function _microTime() {
	var time = process.hrtime();
	return time[0] * 1000000 + time[1]*0.001;
}

function _ipc(callback) {
	if (!servers.ipc) return;
	var client = ipc.connect();
	client.ondata.add(function() {
		client.disconnect();
		callback()
	});
	client.emit('test');
}

function _http(callback){
	if (!servers.http) return;
	var req = http.request('http://localhost:6080', callback);
	req.write('test');
	req.end();
}

function _udp(callback, port){
	if (!servers.udp) return;
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
	if (!servers.tcp) return;
	var client = net.connect(3080);
	client.on('error', function(){});
	client.write('test');
	client.on('data', function(){
		client.end();
		callback();
	});
}

function _teardown(err) {
	if (err) {
		console.log('Error!');
		console.log(err);
	}

	spinner.setText('finishing');
	Object.keys(servers).forEach(function(e) {
		if (servers[e].destroy) servers[e].destroy();

		if (servers[e].close) servers[e].close();
		else console.log('server ' + e + ' has no close method.');
		delete servers[e];
	});
	spinner.stop();

	Object.keys(times).forEach(function(e, i, arr) {
		times[e].avg = Math.round(times[e]._total/times[e].calls);
		delete times[e]._total;
	});
	console.log(times);
}

function main() {
	var tests = [
		_startServers,
		_batchTest.bind({
			name: 'ipc',
			method: _ipc
		}),
		_batchTest.bind({
			name: 'http',
			method: _http
		}),
		_batchTest.bind({
			name: 'udp',
			method: _udp
		}),
		_batchTest.bind({
			name: 'tcp',
			method: _tcp
		})
	];

	spinner.start();

	async.queue(tests, _teardown);
}

function _batchTest(resolve) {
	spinner.setText(this.name);
	var handbreak = false;

	function _runInContext() {
		if (!handbreak) {
			_runTest(this, _runInContext.bind(this));
		}
	}

	_runInContext.call(this);

	setTimeout(function() {
		handbreak = true;
		spinner.setText('preparing');
		setTimeout(function() {
			if (resolve) resolve();
		}, 1000);
	},10000);
}

/* Entry point ---------------------------------------------------------------*/

main();