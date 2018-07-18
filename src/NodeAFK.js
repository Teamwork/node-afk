const Listener = require('./Listener');

class NodeAFK {
  constructor() {
    this.listeners = {};
    this.nextListenerId = 1;
  }

  getAllListeners() {
    return this.listeners;
  }

  // Add a listener to report on the user's activity status
  // inverval - {Number} of Seconds
  // callback - {Function}
  // Returns a {Number} - The id of the listener that was created
  addListener(interval, callback) {
    const listenerId = this.nextListenerId;
    this.nextListenerId += 1;

    const afkListener = new Listener(listenerId, interval, callback);
    afkListener.checkIsAway();

    this.listeners[listenerId] = afkListener;

    return listenerId;
  }

  // Remove a listener
  // id - {Number} id of the listener
  // Returns a {Boolean} to indicate the status of the operation
  removeListener(id) {
    if (this.listeners[id]) {
      this.listeners[id].stop();
      delete this.listeners[id];
      return true;
    }

    return false;
  }

  removeAllListeners() {
    Object.values(this.listeners).forEach((listener) => {
      listener.stop();
    });

    this.listeners = {};
  }
}

module.exports = new NodeAFK();
