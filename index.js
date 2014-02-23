var exec = require('child_process').exec;
if (/^win/.test(process.platform)) var win_idle = require('./lib/idle');

var listeners = [],
	idle = {},
	whenToCheck;


idle.tick = function (callback) {
	callback = callback || function (){};

	if (/^win/.test(process.platform)) {
		callback(Math.round(win_idle.idle() / 1000));
	}
	else if (/darwin/.test(process.platform)) {
		var cmd = '/usr/sbin/ioreg -c IOHIDSystem | /usr/bin/awk \'/HIDIdleTime/ {print int($NF/1000000000); exit}\'';
		exec(cmd, function (error, stdout, stderr) {
			if(error) {
				throw stderr;
			}
			callback(parseInt(stdout, 10));
		});
	}
	else if (/linux/.test(process.platform)) {
		var cmd = 'xprintidle';
		exec(cmd, function (error, stdout, stderr) {
			if(error) {
				callback(0);
				return;
			}
			callback(Math.round(parseInt(stdout, 10) / 1000));
		});
	}
	else {
		callback(0);
	}
}

idle.addListener = function (shouldSeconds, callback) {
	var isAfk = false;

	var listenerId = listeners.push(true) - 1;
	var timeoutRef = null;

	var checkIsAway = function () {

		if(!listeners[listenerId]) {
			clearTimeout(timeoutRef);
			return;
		}

		idle.tick(function(isSeconds){
			var whenSeconds = whenToCheck(isSeconds, shouldSeconds),
				s = 1000;

			if(whenSeconds === 0 && !isAfk) {
				callback({
					status: 'away',
					seconds: isSeconds,
					id: listenerId
				});

				isAfk = true;
				timeoutRef = setTimeout(checkIsAway, s);
			}
			else if(isAfk && whenSeconds > 0) {
				callback({
					status: 'back',
					seconds: isSeconds,
					id: listenerId
				});

				isAfk = false;
				timeoutRef = setTimeout(checkIsAway, whenSeconds * s);
			}
			else if (whenSeconds > 0 && !isAfk){
				timeoutRef = setTimeout(checkIsAway, whenSeconds * s);
			}
			else {
				timeoutRef = setTimeout(checkIsAway, s);
			}
		});
	};

	checkIsAway();

	return listenerId;
};

idle.removeListener = function (listenerId) {
	listeners[listenerId] = false;
	return true;
};

whenToCheck = function (isSeconds, shouldSeconds) {
	var whenSeconds = shouldSeconds - isSeconds;
	return whenSeconds > 0 ? whenSeconds : 0;
}


module.exports = idle;