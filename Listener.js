const desktopIdle = require('desktop-idle');

const AFK_SYSTEM_POLLING_TIMEOUT = 2 * 1000;

class Listener {
    constructor(id, timeToAway, callback) {
        this.id = id;
        this.timeToAway = timeToAway;
        this.timeoutId = null;
        this.callback = callback
        this.isAway = false;
        this.shouldListen = true;

        this.checkIsAway();
    }

    checkIsAway() {
        let idleSeconds;

        try {
            idleSeconds = desktopIdle.getIdleTime();
        } catch (error) {
            this.callback(null, error);
            this.scheduleCheckIsAway();
            return;
        }

        const isAway = idleSeconds > this.timeToAway;

        if (!this.isAway && isAway) {
            this.callback({
                status: 'away',
                seconds: idleSeconds,
                id: this.id
            });

            this.isAway = isAway;
        } else if (this.isAway && !isAway) {
            this.callback({
                status: 'back',
                seconds: idleSeconds,
                id: this.id
            });

            this.isAway = isAway;
        }

        this.scheduleCheckIsAway();
    }

    scheduleCheckIsAway() {
        if (!this.shouldListen) return;
        const delay = this.isAway ? AFK_SYSTEM_POLLING_TIMEOUT : this.timeToAway * 1000;
        this.timeoutId = setTimeout(() => { this.checkIsAway() }, delay);
    }

    removeListener() {
        this.shouldListen = false;
        clearTimeout(this.timeoutId);
    }
}

module.exports = Listener;
