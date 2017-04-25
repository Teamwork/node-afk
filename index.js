var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var os = require('os');
var path = require('path');

var listeners = [],
	idle = {};

// timeout value to ask the system it's idle value
var AFK_SYSTEM_POLLING_TIMEOUT_MSEC = 2 * 1000;

// percentage of the interval to be checked against the idle time. This avoid settings dynamic intervals.
var INTERVAL_AWAY_IDLE_TIME_PERCENTAGE = 0.70;

idle.tick = function (callback) {
	callback = callback || function (){};

	if (/^win/.test(process.platform)) {
		var cmd = path.join( __dirname, 'bin', 'idle.exe');
		execFile(cmd, function (error, stdout, stderr) {
			if(error) {
				callback(0, error);
				return;
			}
			callback(Math.floor(parseInt(stdout, 10) / 1000), null);
		});
	}
	else if (/darwin/.test(process.platform)) {
		var cmd = '/usr/sbin/ioreg -c IOHIDSystem | /usr/bin/awk \'/HIDIdleTime/ {print int($NF/1000000000); exit}\'';
		exec(cmd, function (error, stdout, stderr) {
			if(error) {
				callback(0, error);
				return;
			}
			callback(parseInt(stdout, 10), null);
		});
	}
	else if (/linux/.test(process.platform)) {
		var cmd = 'xprintidle';
		exec(cmd, function (error, stdout, stderr) {
			if(error) {
				callback(0, error);
				return;
			}
			callback(Math.round(parseInt(stdout, 10) / 1000), null);
		});
	}
	else {
		callback(0);
	}
};

idle.addListener = function (intervalSec, callback) {
	var isAfk = false;

	var listenerIndex = listeners.push(true) - 1;
    var defaultIntervalMsec = intervalSec * 1000;
	var timeoutId = null;
    var lastCheckDateMsec = null;

	var checkIsAway = function () {

		if(!listeners[listenerIndex]) {
			clearTimeout(timeoutId);
			return;
		}

        // calculate the duration of the interval. if there's no previous lastCheckDateMsec the duration is a very big number
        // to have no influence on the afk status.
        intervalDurationMsec = Number.MAX_VALUE;
        if(lastCheckDateMsec) {
            intervalDurationMsec = Date.now() - lastCheckDateMsec;
        }

        lastCheckDateMsec = Date.now();

        // ask the system what's the idle time
		idle.tick(function(idleSeconds, error){

            if(error) {
                callback({ id: listenerIndex }, error);
                timeoutId = setTimeout(checkIsAway, defaultIntervalMsec);
                return;
            }

            // is aways if the idle duration is bigger than a interval duration fraction
            isAway = (idleSeconds * 1000) >= (intervalDurationMsec * INTERVAL_AWAY_IDLE_TIME_PERCENTAGE);

            if(!isAfk && isAway) {
                callback({
                	status: 'away',
                	seconds: idleSeconds,
                	id: listenerIndex
                });

                isAfk = true;
            }
            else if(isAfk && !isAway) {
                callback({
                    status: 'back',
                    seconds: idleSeconds,
                    id: listenerIndex
                });

                isAfk = false;
			}

            timeoutId = setTimeout(checkIsAway, isAfk ? AFK_SYSTEM_POLLING_TIMEOUT_MSEC : defaultIntervalMsec);
		});
	};

	checkIsAway();

	return listenerIndex;
};

idle.removeListener = function (listenerIndex) {
    if(listenerIndex < listeners.length){
        listeners.splice(listenerIndex, 1);
        return true;
    }
    else {
        return false;
    }
};

module.exports = idle;
