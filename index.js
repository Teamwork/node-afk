var win_idle = require('./lib/win-idle');
var exec = require('child_process').exec;

function tick(callback) {
	callback = callback || function (){};

	if (/^win/.test(process.platform)) {
		callback(win_idle.idle());
	}
	else if (/darwin/.test(process.platform)) {
		exec('/usr/sbin/ioreg -c IOHIDSystem | /usr/bin/awk \'/HIDIdleTime/ {print int($NF/1000000000); exit}\'', function (error, stdout, stderr) {
			if(error) {
				throw stderr;
			}
			callback(parseInt(stdout, 10));
		});
	}
	else if (/linux/.test(process.platform)) {
		callback(0);
	}
	else {
		callback(0);
	}
}


exports.tick = tick