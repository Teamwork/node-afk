const desktopIdle = require('desktop-idle');

// We want the status of the user to be accurate.
// To ensure this we need to frequently check the users status
const POLLING_INTERVAL = 1000;

class Listener {
  constructor(id, timeUntilAway, callback) {
    this.id = id;
    this.timeUntilAway = timeUntilAway;
    this.callback = callback;
    this.isAway = false;
    this.intervalId = setInterval(() => this.checkIsAway(), POLLING_INTERVAL);
  }

  checkIsAway() {
    let idleSeconds;

    try {
      idleSeconds = desktopIdle.getIdleTime();
    } catch (error) {
      this.callback(null, error);
      return;
    }

    const wasAway = this.isAway;
    const isAway = idleSeconds >= this.timeUntilAway;

    if (!wasAway && isAway) {
      this.callback({
        status: 'away',
        seconds: idleSeconds,
        id: this.id,
      });

      this.isAway = isAway;
    } else if (wasAway && !isAway) {
      this.callback({
        status: 'back',
        seconds: idleSeconds,
        id: this.id,
      });

      this.isAway = isAway;
    }
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

module.exports = Listener;
