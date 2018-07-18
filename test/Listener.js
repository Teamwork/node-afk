/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const desktopIdle = require('desktop-idle');
const Listener = require('../src/Listener');

const testListeners = [];

describe('Listener', () => {
  afterEach(() => {
    testListeners.forEach(listener => listener.stop());
  });

  describe('constructor', () => {
    it('should schedule a check for every 1 second', () => {
      const secondsTilAway = 2;
      const clock = sinon.useFakeTimers();

      const listener = new Listener(1, secondsTilAway);
      testListeners.push(listener);

      expect(listener.intervalId).to.not.be.null;

      global.sandbox.stub(listener, 'checkIsAway').returns();

      expect(listener.checkIsAway.callCount).to.equal(0);
      expect(listener.intervalId).to.not.be.null;

      // Check is scheduled every 1 second
      clock.tick(1500);
      clock.restore();

      expect(listener.checkIsAway.callCount).to.equal(1);
    });
  });

  describe('checkIsAway', () => {
    it('should should let us know if the user is away', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').returns(10);
      const callback = sinon.stub().returns();
      const listener = new Listener(1, 1, callback);
      testListeners.push(listener);

      listener.checkIsAway();

      expect(listener.isAway).to.be.true;
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
      const listener = new Listener(1, 10, callback);
      testListeners.push(listener);

      listener.isAway = true;

      listener.checkIsAway();

      expect(listener.isAway).to.be.false;
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
      const listener = new Listener(1, 10, callback);
      testListeners.push(listener);

      listener.checkIsAway();

      expect(listener.isAway).to.be.false;
      expect(callback.callCount).to.equal(0);
    });
  });

  describe('scheduleCheckIsAway', () => {
    it('should call the callback with an error if something goes wrong', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').throws(new Error('test'));
      const callback = sinon.stub();

      const listener = new Listener(1, 10, callback);
      testListeners.push(listener);

      listener.checkIsAway();

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

      const listener = new Listener(1, secondsTilAway);
      testListeners.push(listener);

      global.sandbox.spy(listener, 'checkIsAway');

      expect(listener.intervalId).to.not.be.null;
      listener.stop();

      expect(listener.intervalId).to.be.null;

      clock.tick(2000);
      clock.restore();

      expect(listener.checkIsAway.callCount).to.equal(0);
    });
  });
});
