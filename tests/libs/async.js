// Imported from Kalm 

function _promisify(method) {
	return new Promise(method);
}	

function all(list, callback) {
	Promise.all(list.map(_promisify)).then(function() {
		callback();
	},
	function(err) {
		callback(err || 'unhandled_error');
		cl.error('Boot failure: ');
		cl.error(err);
	});
}

//For some reason, it's not doing the tasks in a 
//synchronous manner... had to go full dirty
function queue(list, callback) {
	if (list.length === 0) callback();

	for(var i = 0; i < list.length; i++) {
		list[i](list[i+1] || callback);
	}
}

module.exports = {
	all: all,
	queue: queue
};