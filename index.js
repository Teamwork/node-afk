const Listener = require('./Listener');

class NodeAFK {
    constructor() {
        this.AFK_POLLING_TIMEOUT_MSEC = 2 * 1000;
        this.INTERVAL_AWAY_IDLE_TIME_PERCENTAGE = 0.7;
        this.listeners = {};
    }

    // Add a listener to check when the user is away
    // Interval - {Number} of Seconds
    // callback - {Function}
    // Returns a {Number} - The id of the listener that was created
    addListener(interval, callback) {
        const randomId = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);

        // Just in case of the very very small proability
        // that the randomId was generated for another listener
        if (this.listeners[randomId]) {
            this.addListener(interval, callback);
            return;
        }

        this.listeners[randomId] = new Listener(randomId, interval, callback);

        return randomId;
    }

    // Remove a listener
    // id - {Number} id of the listener
    // Returns a Boolean of the success of the operation
    removeListener(id) {
        if (this.listeners[id]) {
            this.listeners[id].removeListener();
            delete this.listeners[id];
            return true
        }

        return false;
    }
}

module.exports = new NodeAFK();
