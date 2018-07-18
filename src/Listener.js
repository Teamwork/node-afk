const desktopIdle = require('desktop-idle');

// We want the status of the user to be accurate.
// To ensure this we need to frequently check the users status
const POLLING_INTERVAL = 1000;

class Listener {
  // id - {Number} id to assign to the listener
  // timeUntilAway - {Number} - Seconds of no activity until a user should be classed as 'away'
  // callback - {Function} - Function to call with user status updates
  constructor(id, timeUntilAway, callback) {
    this.id = id;
    this.timeUntilAway = timeUntilAway;
    this.callback = callback;
    this.isAway = false;
    this.intervalId = setInterval(() => this.checkIsAway(), POLLING_INTERVAL);
  }

  // Checks if the user is away or active
  // Calls the callback with an {Object} containing the following properties
  //  :status - {String} - 'away' if the user is now away, 'back' if the user was away
  //    and is now active
  //  :seconds - {Number} - The seconds that have passed without any interaction from the user
  //  :id - {Number} - The id of the listener
  // The callback will only be called if the users status has changed since the last check.
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
