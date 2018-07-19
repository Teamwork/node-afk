const StatusWatcher = require('./StatusWatcher');

class NodeAFK {
  constructor() {
    this.watchers = {};
    this.nextWatcherId = 1;
  }

  getAllWatchers() {
    return this.watchers;
  }

  // Add a watcher to report on the user's activity status
  // inverval - {Number} of Seconds
  // callback - {Function}
  // Returns a {Number} - The id of the watcher that was created
  addWatcher(interval, callback) {
    const watcherId = this.nextWatcherId;
    this.nextwatcherId += 1;

    const statusWatcher = new StatusWatcher(watcherId, interval, callback);
    statusWatcher.start();

    this.watchers[watcherId] = statusWatcher;

    return watcherId;
  }

  // Remove a watcher
  // id - {Number} id of the watcher
  // Returns a {Boolean} to indicate the status of the operation
  removeWatcher(id) {
    if (this.watchers[id]) {
      this.watchers[id].stop();
      delete this.watchers[id];
      return true;
    }

    return false;
  }

  removeAllWatchers() {
    Object.values(this.watchers).forEach((watcher) => {
      watcher.stop();
    });

    this.watchers = {};
  }
}

module.exports = new NodeAFK();
