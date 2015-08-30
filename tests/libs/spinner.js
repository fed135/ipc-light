var _spinnerSymbols = ['/','-','\\','|'];
var _spinnerTimer;
var text = '';

function _startSpinner() {
	_stopSpinner();
	_spinnerTimer = setInterval(_stepSpinner, 90);
}

function _stepSpinner() {
	_spinnerSymbols.push(_spinnerSymbols.shift());
	process.stdout.write('\r ' + text + ' ' + _spinnerSymbols[0]);
}

function _stopSpinner() {
	if (_spinnerTimer) clearInterval(_spinnerTimer);
	process.stdout.write('\r \n'); 
}

module.exports = {
	start: _startSpinner,
	stop: _stopSpinner,
	setText: function(txt) {
		text = txt;
	}
};