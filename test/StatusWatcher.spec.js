/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const desktopIdle = require('desktop-idle');
const StatusWatcher = require('../src/StatusWatcher');

const testWatchers = [];

describe('StatusWatcher', () => {
  afterEach(() => {
    testWatchers.forEach(watcher => watcher.stop());
  });

  describe('start', () => {
    it('should schedule a check for every 1 second', () => {
      const secondsTilAway = 2;
      const clock = sinon.useFakeTimers();

      const watcher = new StatusWatcher(1, secondsTilAway);
      testWatchers.push(watcher);

      expect(watcher.intervalId).to.be.null;
      watcher.start();

      expect(watcher.intervalId).to.not.be.null;

      global.sandbox.stub(watcher, 'checkStatus').returns();

      expect(watcher.checkStatus.callCount).to.equal(0);
      expect(watcher.intervalId).to.not.be.null;

      // Check is scheduled every 1 second
      clock.tick(1500);
      clock.restore();

      expect(watcher.checkStatus.callCount).to.equal(1);
    });
  });

  describe('checkStatus', () => {
    it('should should let us know if the user is away', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').returns(10);
      const callback = sinon.stub().returns();
      const watcher = new StatusWatcher(1, 1, callback);
      testWatchers.push(watcher);

      watcher.checkStatus();

      expect(watcher.isAway).to.be.true;
      expect(callback.callCount).to.equal(1);
      expect(callback.firstCall.args[0]).to.be.null;
      expect(callback.firstCall.args[1]).to.deep.equal({
        id: 1,
        seconds: 10,
        status: 'away',
      });
    });

    it('should should let us know if the user is active if they are set to away', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').returns(5);
      const callback = sinon.stub().returns();
      const watcher = new StatusWatcher(1, 10, callback);
      testWatchers.push(watcher);

      watcher.isAway = true;

      watcher.checkStatus();

      expect(watcher.isAway).to.be.false;
      expect(callback.callCount).to.equal(1);
      expect(callback.firstCall.args[0]).to.be.null;
      expect(callback.firstCall.args[1]).to.deep.equal({
        id: 1,
        seconds: 5,
        status: 'back',
      });
    });

    it('shouldnt let us know if the status hasnt changed since the last check', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').returns(5);
      const callback = sinon.stub().returns();
      const watcher = new StatusWatcher(1, 10, callback);
      testWatchers.push(watcher);

      watcher.checkStatus();

      expect(watcher.isAway).to.be.false;
      expect(callback.callCount).to.equal(0);
    });
  });

  describe('schedulecheckStatus', () => {
    it('should call the callback with an error if something goes wrong', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').throws(new Error('test'));
      const callback = sinon.stub();

      const watcher = new StatusWatcher(1, 10, callback);
      testWatchers.push(watcher);

      watcher.checkStatus();

      expect(callback.callCount).to.equal(1);
      expect(callback.firstCall.args[0] instanceof Error).to.be.true;
      expect(callback.firstCall.args[0].message).to.equal('test');
      expect(callback.firstCall.args[1]).to.be.null;
    });
  });

  describe('stop', () => {
    it('should stop afk checks', () => {
      const secondsTilAway = 2;
      const clock = sinon.useFakeTimers();

      const watcher = new StatusWatcher(1, secondsTilAway);
      watcher.start();
      testWatchers.push(watcher);

      global.sandbox.spy(watcher, 'checkStatus');

      expect(watcher.intervalId).to.not.be.null;
      watcher.stop();

      expect(watcher.intervalId).to.be.null;

      clock.tick(2000);
      clock.restore();

      expect(watcher.checkStatus.callCount).to.equal(0);
    });
  });
});
