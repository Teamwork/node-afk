/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const desktopIdle = require('desktop-idle');
const Listener = require('../src/Listener');

describe('Listener', () => {
  describe('checkIsAway', () => {
    it('should should let us know if the user is away', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').returns(10);
      const callback = sinon.stub().returns();
      const listener = new Listener(1, 1, callback);

      global.sandbox.stub(listener, 'scheduleCheckIsAway').returns();

      listener.checkIsAway();

      expect(listener.isAway).to.be.true;
      expect(callback.callCount).to.equal(1);
      expect(callback.firstCall.args[0]).to.deep.equal({
        id: 1,
        seconds: 10,
        status: 'away',
      });

      expect(listener.scheduleCheckIsAway.callCount).to.equal(1);
    });

    it('should should let us know if the user is active if they are set to away', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').returns(5);
      const callback = sinon.stub().returns();
      const listener = new Listener(1, 10, callback);

      listener.isAway = true;

      global.sandbox.stub(listener, 'scheduleCheckIsAway').returns();

      listener.checkIsAway();

      expect(listener.isAway).to.be.false;
      expect(callback.callCount).to.equal(1);
      expect(callback.firstCall.args[0]).to.deep.equal({
        id: 1,
        seconds: 5,
        status: 'back',
      });

      expect(listener.scheduleCheckIsAway.callCount).to.equal(1);
    });

    it('shouldnt let us know if the status hasnt changed since the last check', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').returns(5);
      const callback = sinon.stub().returns();
      const listener = new Listener(1, 10, callback);

      global.sandbox.stub(listener, 'scheduleCheckIsAway').returns();

      listener.checkIsAway();

      expect(listener.isAway).to.be.false;
      expect(callback.callCount).to.equal(0);
      expect(listener.scheduleCheckIsAway.callCount).to.equal(1);
    });
  });

  describe('scheduleCheckIsAway', () => {
    it('shouldnt schedule the check if weve told it not too', () => {
      const listener = new Listener(1, 10);
      listener.shouldListen = false;

      listener.scheduleCheckIsAway();

      expect(listener.timeoutId).to.be.null;
    });

    it('should call the callback with an error if something goes wrong', () => {
      global.sandbox.stub(desktopIdle, 'getIdleTime').throws(new Error('test'));
      const callback = sinon.stub();

      const listener = new Listener(1, 10, callback);

      global.sandbox.stub(listener, 'scheduleCheckIsAway').returns();

      listener.checkIsAway();

      expect(callback.callCount).to.equal(1);
      expect(callback.firstCall.args[0]).to.be.null;
      expect(callback.firstCall.args[1] instanceof Error).to.be.true;
      expect(callback.firstCall.args[1].message).to.equal('test');
    });

    it('should schedule the check for a quater of the away time if the user is active', () => {
      const secondsTilAway = 40;
      const expectedMiliSecondsForSchedule = (secondsTilAway / 4) * 1000;
      const listener = new Listener(1, secondsTilAway);
      const clock = sinon.useFakeTimers();

      global.sandbox.stub(listener, 'checkIsAway').returns();

      listener.scheduleCheckIsAway();

      expect(listener.checkIsAway.callCount).to.equal(0);
      expect(listener.timeoutId).to.not.be.null;

      clock.tick(expectedMiliSecondsForSchedule + 1000);
      clock.restore();

      expect(listener.checkIsAway.callCount).to.equal(1);
    });

    it('should schedule the check for set time if the user is not active', () => {
      const defaultAwayCheckTime = 2000;
      const listener = new Listener(1, 40);
      listener.isAway = true;
      const clock = sinon.useFakeTimers();

      global.sandbox.stub(listener, 'checkIsAway').returns();

      listener.scheduleCheckIsAway();

      expect(listener.checkIsAway.callCount).to.equal(0);
      expect(listener.timeoutId).to.not.be.null;

      clock.tick(defaultAwayCheckTime + 1000);
      clock.restore();

      expect(listener.checkIsAway.callCount).to.equal(1);
    });
  });

  describe('removeListener', () => {
    it('should stop afk checks', () => {
      const secondsTilAway = 40;
      const timeToCheckForCall = (secondsTilAway / 4) * 1000;
      const clock = sinon.useFakeTimers();

      const listener = new Listener(1, secondsTilAway);

      global.sandbox.spy(listener, 'checkIsAway');

      listener.scheduleCheckIsAway();

      expect(listener.timeoutId).to.not.be.null;
      listener.removeListener();

      expect(listener.shouldListen).to.be.false;
      expect(listener.timeoutId).to.be.null;

      clock.tick(timeToCheckForCall * 4);
      clock.restore();

      expect(listener.checkIsAway.callCount).to.equal(0);
    });
  });
});
