var os = require('os');
var win_idle;

if (typeof process.versions['node-webkit']  != "undefined") {
	if (/0\.10\./.test(process.versions.node)) {
		win_idle = require('./nw/0.10.x/idle');
	}
	else {
		win_idle = require('./nw/0.11.x/idle');
	}
}
else {
	if(/64/.test(os.arch())) {
		win_idle = require('./x64/0.10.x/idle')
	}
	else {
		win_idle = require('./x32/0.10.x/idle')
	}
}

module.exports = win_idle;