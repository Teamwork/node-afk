/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');

const StatusWatcher = require('../src/StatusWatcher');
const NodeAFK = require('../src/NodeAFK');

describe('NodeAFK', () => {
  afterEach(() => {
    NodeAFK.removeAllWatchers();
  });

  describe('getAllWatchers', () => {
    it('should get all watchers', () => {
      NodeAFK.watchers[1] = new StatusWatcher();
      NodeAFK.watchers[2] = new StatusWatcher();

      expect(Object.keys(NodeAFK.getAllWatchers()).length).to.equal(2);
    });
  });

  describe('addWatcher', () => {
    it('should create and start a new Status Watcher', () => {
      global.sandbox.stub(StatusWatcher.prototype, 'start').returns();

      const watcherId = NodeAFK.addWatcher(1, () => {});

      const watchers = NodeAFK.getAllWatchers();

      expect(Object.keys(watchers).length).to.equal(1);

      const watcher = watchers[watcherId];

      expect(typeof watcher).to.equal('object');
      /* eslint-disable-next-line */
      expect(watcher instanceof StatusWatcher).to.be.true;
      expect(watcher.start.callCount).to.equal(1);
    });
  });

  describe('removeWatcher', () => {
    it('should remove a watcher by its id', () => {
      const newWatcher = new StatusWatcher();
      global.sandbox.spy(newWatcher, 'stop');
      const watcherId = 1;

      NodeAFK.watchers[watcherId] = newWatcher;

      expect(Object.keys(NodeAFK.getAllWatchers()).length).to.equal(1);
      const watcher = NodeAFK.getAllWatchers()[watcherId];
      const result = NodeAFK.removeWatcher(watcherId);

      expect(result).to.be.true;
      expect(Object.keys(NodeAFK.getAllWatchers()).length).to.equal(0);
      expect(watcher.stop.callCount).to.equal(1);
    });

    it('should return false if a watcher could not be removed', () => {
      const result = NodeAFK.removeWatcher(999999);
      expect(result).to.be.false;
    });
  });

  describe('removeAllWatchers', () => {
    it('should remove all watchers', () => {
      const firstWatcher = new StatusWatcher();
      const secondWatcher = new StatusWatcher();

      global.sandbox.spy(firstWatcher, 'stop');
      global.sandbox.spy(secondWatcher, 'stop');

      NodeAFK.watchers[1] = firstWatcher;
      NodeAFK.watchers[2] = secondWatcher;

      const watchers = NodeAFK.getAllWatchers();

      expect(Object.keys(watchers).length).length.to.equal(2);

      NodeAFK.removeAllWatchers();

      Object.values(watchers).forEach((watcher) => {
        expect(watcher.stop.callCount).to.equal(1);
      });

      expect(Object.keys(NodeAFK.getAllWatchers()).length).to.equal(0);
    });
  });
});
