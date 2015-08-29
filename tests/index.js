var ipc = require('../index');

//Values
var server_a;
var server_b;

var client_a;
var client_b;

//Server
describe('Starting:', function() {
	
	//Creation - no args
	it('a) #createServer()', function() {
		server_a = ipc.createServer(function(request, reply) {
			//console.log('a) handler');
			//console.log(request);
    	reply('server_a');
    }).listen();
	});

	//Creation - with args
	it('b) #createServer(args)', function() {
		server_b = ipc.createServer(function(request, reply) {
			//console.log('b) handler');
			//console.log(request);
    	reply('server_b');
    }).listen('/var/tmp/test_test.socket');
	});
});

//Client
describe('Connecting:', function() {
	
	//Creation - no args
	it('a) #connect()', function() {
		client_a = ipc.connect();
	});

	//Creation - with args
	it('b) #connect(args)', function() {
		client_b = ipc.connect({ 
			path: '/var/tmp/test_test.socket'
		});
	});
});

describe('Client:', function() {
	it('a) #emit()', function() {
		client_a.ondata.add(function(data) {
			//console.log('a) emit response:');
			//console.log(data);
		});
		client_a.emit('some payload');
	});

	it('b) #emit()', function() {
		client_b.ondata.add(function(data) {
			//console.log('b) emit response:');
			//console.log(data);
		});
		client_b.emit({foo:'bar'});
	});
});

describe('Server:', function() {
	it('a) #broadcast()', function() {
		server_a.broadcast('some broadcast');
	});

	it('b) #broadcast()', function() {
		server_b.broadcast({bar:'foo'});
	});	
});

describe('Teardown:', function() {
	it('a) #disconnect()', function() {
		client_a.disconnect();
	});

	it('b) #disconnect()', function() {
		client_b.disconnect();
	});

	it('a) #close()', function() {
		server_a.close();
	});

	it('b) #close()', function() {
		server_b.close();
	});
});