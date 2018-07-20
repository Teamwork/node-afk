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

    const afk = new NodeAFK(inactivityDuration, pollInterval, NodeAFK.STATUS_AWAY);

    expect(afk).to.have.property('inactivityDuration', inactivityDuration);
    expect(afk).to.have.property('pollInterval', pollInterval);
    expect(afk).to.have.property('currentStatus', NodeAFK.STATUS_AWAY);
  });

  it('should create a new instance with a default poll interval', () => {
    const inactivityDuration = 10000;
    const expectedDefaultPollInterval = 1000;

    const afk = new NodeAFK(inactivityDuration);

    expect(afk).to.have.property('pollInterval', expectedDefaultPollInterval);
  });

  it('should create a new instance with a default current status', () => {
    const inactivityDuration = 10000;
    const expectedDefaultStatus = NodeAFK.STATUS_ONLINE;

    const afk = new NodeAFK(inactivityDuration);

    expect(afk).to.have.property('currentStatus', expectedDefaultStatus);
  });

  it('should set the current status', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    const status = NodeAFK.STATUS_AWAY;

    afk.setStatus(status);

    expect(afk.currentStatus).to.equal(status);
  });

  it('should throw an error if an invalid value is used when setting the current status', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    const status = 'foo';

    expect(() => afk.setStatus(status)).to.throw('foo is not a valid status');
  });

  it('should record when the user came online when their status is set to online', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    // the status of the user will be `online` by default so no need to
    // explicitly call setStatus here

    expect(afk.userLastCameOnlineAt).to.not.equal(undefined);
  });

  it('should discard the value stored for when the user came online when their status is set to away', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    afk.setStatus(NodeAFK.STATUS_AWAY);

    expect(afk.userLastCameOnlineAt).to.equal(undefined);
  });

  it('should setup the poll interval on intialisation', () => {
    const inactivityDuration = 10000;
    const pollInterval = 1000;

    const setIntervalStub = sandbox.stub(global, 'setInterval');

    const afk = new NodeAFK(inactivityDuration, pollInterval);

    afk.init();

    expect(setIntervalStub.callCount).to.equal(1);
    expect(setIntervalStub.firstCall.args[0]).to.be.instanceOf(Function);
    expect(setIntervalStub.firstCall.args[1]).to.equal(pollInterval);
  });

  it('should stop an existing poll interval before setting up a new poll interval on intialisation', () => {
    const inactivityDuration = 10000;

    sandbox.stub(global, 'setInterval');

    const afk = new NodeAFK(inactivityDuration);

    const destroyStub = sandbox.stub(afk, 'destroy');

    afk.init();

    expect(destroyStub.callCount).to.equal(1);
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

    afk.on('away:2000', () => {});
    afk.destroy();

    expect(afk.timedEvents).to.deep.equal([]);
  });

  it('should remove any event listeners that have been setup when destroyed', () => {
    const inactivityDuration = 10000;

    const afk = new NodeAFK(inactivityDuration);

    afk.on('away', () => {});
    afk.destroy();

    expect(afk.eventNames().length).to.equal(0);
  });

  it('should emit a "status-change" event when the status of the user changes from online to away', () => {
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
      previousStatus: NodeAFK.STATUS_ONLINE,
      currentStatus: NodeAFK.STATUS_AWAY,
    });
  });

  it('should emit a "status-change" event when the status of the user changes from away to online', () => {
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
    afk.setStatus(NodeAFK.STATUS_AWAY);

    afk.on('status-change', listener);

    clock.tick(oneSecond);

    expect(listener.callCount).to.equal(1);
    expect(listener.firstCall.args[0]).to.deep.equal({
      previousStatus: NodeAFK.STATUS_AWAY,
      currentStatus: NodeAFK.STATUS_ONLINE,
    });
  });

  it('should emit a "status:away" event when the status of the user changes from online to away', () => {
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

    afk.on('status:away', listener);

    clock.tick(inactivityDuration);

    expect(listener.callCount).to.equal(1);
  });

  it('should emit a "status:online" event when the status of the user changes from online to away', () => {
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
    afk.setStatus(NodeAFK.STATUS_AWAY);

    afk.on('status:online', listener);

    clock.tick(oneSecond);

    expect(listener.callCount).to.equal(1);
  });

  it('should emit a "away:<time>" event when user has been away for the specified amount of time', () => {
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

    afk.on('away:3000', listener);

    clock.tick(inactivityDuration); // user is now offline
    clock.tick(oneSecond * 3); // "away:3000" event is emitted

    expect(listener.callCount).to.equal(1);
  });

  it('should emit a "online:<time>" event when user has been online for the specified amount of time', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listener = sandbox.stub();

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('online:3000', listener);

    clock.tick(oneSecond * 3); // "online:3000" event is emitted

    expect(listener.callCount).to.equal(1);
  });

  it('should unregister a timed event', () => {
    const oneSecond = 1000;
    const inactivityDuration = oneSecond * 2;
    const clock = sandbox.useFakeTimers();
    const listenerToKeep = sandbox.stub();
    const listenerToRemove = sandbox.stub();

    const afk = new NodeAFK(inactivityDuration, oneSecond);

    afk.init();

    afk.on('online:3000', listenerToKeep);
    afk.on('online:3000', listenerToRemove);

    clock.tick(oneSecond);

    afk.off('online:3000', listenerToRemove);

    clock.tick(oneSecond * 2); // "online:3000" event is emitted

    expect(listenerToKeep.callCount).to.equal(1);
    expect(listenerToRemove.callCount).to.equal(0);
  });
});
