var exec = require('child_process').exec;
if (/^win/.test(process.platform)) var win_idle = require('./lib/idle');

function tick(callback) {
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
		getLinuxIdleTime(callback);
	}
	else {
		callback(0);
	}
}


function getLinuxIdleTime (callback) {
	var string = 'USER IDLE\ndonal 13.75s\ndonal 27:35\ndonal 19:43\ndonal 7.00s';
	exec('w | awk "{if (NR!=1) {print $1,$5 }}"\'', function (error, stdout, stderr) {
		if(error) {
			throw stderr;
		}
		var times = stdout.match(/(\d{1,2}:\d\d)|(\d{1,2}.\d\ds)/g);

		var shortestTime = -1;

		times.forEach(function(string, i){
			var seconds, tmpArray;

			if(string.indexOf('s') !== -1) {
				tmpArray = string.split(':');
				seconds = parseInt(tmpArray[0], 10);
			}
			else {
				tmpArray = string.split(':');
				seconds = (parseInt(tmpArray[0], 10) * 60) + parseInt(tmpArray[1], 10);
			}

			if(shortestTime === -1 || seconds < shortestTime) {
				shortestTime = seconds;
			}
		});

		callback(shortestTime);
	});
}

exports.tick = tick
