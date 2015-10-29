# Examples

## Setting up a server

    var ipc = require('ipc-light');

    var server = ipc.createServer(function(request, reply) {
    	reply('Hello there!');
    }).listen();


## Connecting to a server

    var ipc = require('ipc-light');

    var socket = ipc.connect({}, function() {
    	socket.emit('Hello, neighbour!');
    });

    socket.ondata.add(function(request, reply) {
    	//Check request.payload for data
    	reply('Sounds nice!');
    });


## Broadcasting

    server.broadcast({
    	message: 'I\'m holding a barbecue this weekend.',
    	time: '4PM',
    	address: 'Mt doom.'
    });
