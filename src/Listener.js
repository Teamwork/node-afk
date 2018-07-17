const desktopIdle = require('desktop-idle');

// We want the status of the user to be accurate.
// To ensure this we need to frequently check the users status
const DEFAULT_POLLING_TIMEOUT = 1000;

class Listener {
  constructor(id, timeToAway, callback) {
    this.id = id;
    this.timeToAway = timeToAway;
    this.timeoutId = null;
    this.callback = callback;
    this.isAway = false;
    this.shouldListen = true;
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

    const isAway = idleSeconds >= this.timeToAway;

    if (!this.isAway && isAway) {
      this.callback({
        status: 'away',
        seconds: idleSeconds,
        id: this.id,
      });

      this.isAway = isAway;
    } else if (this.isAway && !isAway) {
      this.callback({
        status: 'back',
        seconds: idleSeconds,
        id: this.id,
      });

      this.isAway = isAway;
    }

    this.scheduleCheckIsAway();
  }

  scheduleCheckIsAway() {
    if (!this.shouldListen) return;
    this.timeoutId = setTimeout(() => { this.checkIsAway(); }, DEFAULT_POLLING_TIMEOUT);
  }

  removeListener() {
    this.shouldListen = false;
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
}

module.exports = Listener;
