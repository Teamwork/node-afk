/* global describe, afterEach, it */

const { expect } = require('chai');
const desktopIdle = require('desktop-idle');
const EventEmitter = require('events');
const sinon = require('sinon');
const NodeAFK = require('./NodeAFK');

const sandbox = sinon.createSandbox();

describe('NodeAFK', () => {
  afterEach(sandbox.restore);

  it('should be an event emitter', () => {
    const afk = new NodeAFK(1000);

    expect(afk).to.be.instanceOf(EventEmitter);
  });

  it('should create a new instance with the correct parameters', () => {
    const inactivityDuration = 10000;
    const pollInterval = 5000;

    const afk = new NodeAFK(inactivityDuration, pollInterval);

    expect(afk).to.have.property('inactivityDuration', inactivityDuration);
    expect(afk).to.have.property('pollInterval', pollInterval);
  });

  it('should create a new instance with a default poll interval', () => {
    const inactivityDuration = 10000;
    const expectedDefaultPollInterval = 1000;

    const afk = new NodeAFK(inactivityDuration);

    expect(afk).to.have.property('pollInterval', expectedDefaultPollInterval);
  });

  it('should create a new instance with a default current status', () => {
    const inactivityDuration = 10000;
    const expectedDefaultStatus = NodeAFK.STATUS_ACTIVE;

    const afk = new NodeAFK(inactivityDuration);

    expect(afk).to.have.property('currentStatus', expectedDefaultStatus);
  });

  it('should set the current status', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    const status = NodeAFK.STATUS_IDLE;

    afk.setStatus(status);

    expect(afk.currentStatus).to.equal(status);
  });

  it('should throw an error if an invalid value is used when setting the current status', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    const status = 'foo';

    expect(() => afk.setStatus(status)).to.throw('foo is not a valid status');
  });

  it('should record when the user became active when their status is set to active', () => {
    const inactivityDuration = 10000;
    const clock = sandbox.useFakeTimers();

    const afk = new NodeAFK(inactivityDuration);

    // the status of the user will be `active` by default so no need to
    // explicitly call setStatus here

    expect(afk.userLastActiveAt).to.not.equal(undefined);

    // check that userLastActiveAt is updated each the status of the user changes to active

    const { userLastActiveAt } = afk;

    afk.setStatus(NodeAFK.STATUS_IDLE);

    clock.tick(1000);

    afk.setStatus(NodeAFK.STATUS_ACTIVE);

    expect(afk.userLastActiveAt).to.be.a('Number');
    expect(userLastActiveAt).to.be.lt(afk.userLastActiveAt);
  });

  it('should setup the poll interval on intialisation', () => {
    const inactivityDuration = 10000;
    const pollInterval = 1000;

    const setIntervalStub = sandbox.stub(global, 'setInterval').returns(123);

    const afk = new NodeAFK(inactivityDuration, pollInterval);

    afk.init();

    expect(setIntervalStub.callCount).to.equal(1);
    expect(setIntervalStub.firstCall.args[0]).to.be.instanceOf(Function);
    expect(setIntervalStub.firstCall.args[1]).to.equal(pollInterval);
  });

  it('should throw an error if initialising an already intialised instance', () => {
    const inactivityDuration = 10000;

    sandbox.stub(global, 'setInterval').returns(123);

    const afk = new NodeAFK(inactivityDuration);

    afk.init();

    expect(() => afk.init()).to.throw('node-afk instance has already been initialised');
  });

  it('should stop the poll interval if the poll has been setup when destroyed', () => {
    const inactivityDuration = 10000;
    const expectedPollIntervalId = 123;

    sandbox.stub(global, 'setInterval').returns(expectedPollIntervalId);

    const clearIntervalStub = sandbox.stub(global, 'clearInterval');

    const afk = new NodeAFK(inactivityDuration);

    afk.init();
    afk.destroy();

    expect(clearIntervalStub.callCount).to.equal(1);
    expect(clearIntervalStub.firstCall.args).to.deep.equal([expectedPollIntervalId]);
  });

  it('should not attempt to stop the poll interval if the poll has not been setup when destroyed', () => {
    const inactivityDuration = 10000;

    const clearIntervalStub = sandbox.stub(global, 'clearInterval');

    const afk = new NodeAFK(inactivityDuration);

    afk.destroy();

    expect(clearIntervalStub.callCount).to.equal(0);
  });

  it('should clear any timed events that have been setup when destroyed', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    afk.on('idle:2000', () => {});
    afk.destroy();

    expect(afk.timedEvents).to.deep.equal([]);
  });

  it('should remove any event listeners that have been setup when destroyed', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    afk.on('status:idle', () => {});
    afk.destroy();

    expect(afk.eventNames().length).to.equal(0);
  });

  it('should emit a "status-change" event when the status of the user changes from active to idle', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listener = sandbox.stub();

    sandbox.stub(desktopIdle, 'getIdleTime')
      .onFirstCall()
      .returns(oneSecond)
      .onSecondCall()
      .returns(oneSecond * 2);

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('status-change', listener);

    clock.tick(inactivityDuration);

    expect(listener.callCount).to.equal(1);
    expect(listener.firstCall.args[0]).to.deep.equal({
      previousStatus: NodeAFK.STATUS_ACTIVE,
      currentStatus: NodeAFK.STATUS_IDLE,
    });
  });

  it('should emit a "status-change" event when the status of the user changes from idle to active', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listener = sandbox.stub();

    sandbox.stub(desktopIdle, 'getIdleTime')
      .onFirstCall()
      .returns(oneSecond)
      .onSecondCall()
      .returns(oneSecond * 2);

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();
    afk.setStatus(NodeAFK.STATUS_IDLE);

    afk.on('status-change', listener);

    clock.tick(oneSecond);

    expect(listener.callCount).to.equal(1);
    expect(listener.firstCall.args[0]).to.deep.equal({
      previousStatus: NodeAFK.STATUS_IDLE,
      currentStatus: NodeAFK.STATUS_ACTIVE,
    });
  });

  it('should emit a "status:idle" event when the status of the user changes from active to idle', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listener = sandbox.stub();

    sandbox.stub(desktopIdle, 'getIdleTime')
      .onFirstCall()
      .returns(oneSecond)
      .onSecondCall()
      .returns(oneSecond * 2);

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('status:idle', listener);

    clock.tick(inactivityDuration);

    expect(listener.callCount).to.equal(1);
  });

  it('should emit a "status:active" event when the status of the user changes from active to idle', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listener = sandbox.stub();

    sandbox.stub(desktopIdle, 'getIdleTime')
      .onFirstCall()
      .returns(oneSecond)
      .onSecondCall()
      .returns(oneSecond * 2);

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();
    afk.setStatus(NodeAFK.STATUS_IDLE);

    afk.on('status:active', listener);

    clock.tick(oneSecond);

    expect(listener.callCount).to.equal(1);
  });

  it('should emit a "idle:<time>" event when user has been idle for the specified amount of time', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listener = sandbox.stub();

    const getIdleTimeStub = sandbox.stub(desktopIdle, 'getIdleTime');

    // getIdleTime will be called 5 times in one second intervals
    for (let i = 0; i <= 4; i += 1) {
      getIdleTimeStub.onCall(i).returns(oneSecond * (i + 1));
    }

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('idle:3000', listener);

    clock.tick(inactivityDuration); // user is now idle
    clock.tick(oneSecond * 3); // "idle:3000" event is emitted

    expect(listener.callCount).to.equal(1);
  });

  it('should emit a "active:<time>" event when user has been active for the specified amount of time', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listener = sandbox.stub();

    sandbox.stub(desktopIdle, 'getIdleTime').returns(0);

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('active:3000', listener);

    clock.tick(oneSecond * 3); // "active:3000" event is emitted

    expect(listener.callCount).to.equal(1);
  });

  it('should emit a "error" event when retrieval of the idle time from the system fails', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const activeForDurationListener = sandbox.stub();
    const errorListener = sandbox.stub();
    const getIdleTimeErrorMessage = 'foo';
    const getIdleTimeError = new Error(getIdleTimeErrorMessage);

    sandbox.stub(desktopIdle, 'getIdleTime')
      .onFirstCall()
      .throws(getIdleTimeError);

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('active:1000', activeForDurationListener);
    afk.on('error', errorListener);

    clock.tick(oneSecond * 1); // "active:1000" event would normally be emitted

    expect(activeForDurationListener.callCount).to.equal(0);
    expect(errorListener.callCount).to.equal(1);
    expect(errorListener.firstCall.args[0]).to.be.a('Error');
    expect(errorListener.firstCall.args[0]).to.have.property('message', `Failed to retrieve the idle time from the system: ${getIdleTimeErrorMessage}`);
  });

  it('should unregister a timed event', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listenerToKeep = sandbox.stub();
    const listenerToRemove = sandbox.stub();

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('active:3000', listenerToKeep);
    afk.on('active:3000', listenerToRemove);

    clock.tick(oneSecond);

    afk.off('active:3000', listenerToRemove);

    clock.tick(oneSecond * 2); // "active:3000" event is emitted

    expect(listenerToKeep.callCount).to.equal(1);
    expect(listenerToRemove.callCount).to.equal(0);
  });
});
