var systemIdleTime = require('@paulcbetts/system-idle-time');

var listeners = [],
    addListener,
    tick,
    removeListener;


// timeout value to ask the system it's idle value
var AFK_SYSTEM_POLLING_TIMEOUT_MSEC = 2 * 1000;

// percentage of the interval to be checked against the idle time. This avoid settings dynamic intervals.
var INTERVAL_AWAY_IDLE_TIME_PERCENTAGE = 0.70;

tick = function () {
    return Math.floor(systemIdleTime.getIdleTime() / 1000);
};

addListener = function (intervalSec, callback) {
    var isAfk = false;

    var listenerIndex = listeners.push(true) - 1;
    var defaultIntervalMsec = intervalSec * 1000;
    var timeoutId = null;
    var lastCheckDateMsec = null;

    var checkIsAway = function () {
        var idleSeconds,
            error;

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
        try {
            idleSeconds = tick();
        } catch (err) {
            callback({id: listenerIndex}, err)
            timeoutId = setTimeout(checkIsAway, defaultIntervalMsec);
            return
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
    };

    checkIsAway();

    return listenerIndex;
};

removeListener = function (listenerIndex) {
    if(listenerIndex < listeners.length){
        listeners.splice(listenerIndex, 1);
        return true;
    }
    else {
        return false;
    }
};
module.exports = {
    removeListener: removeListener,
    addListener: addListener,
    tick: tick
};
