/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');

const Listener = require('../src/Listener');
const NodeAFK = require('../src/NodeAFK');

describe('NodeAFK', () => {
  afterEach(() => {
    NodeAFK.removeAllListeners();
  });

  describe('getAllListeners', () => {
    it('should get all Listeners', () => {
      NodeAFK.listeners[1] = new Listener();
      NodeAFK.listeners[2] = new Listener();

      expect(Object.keys(NodeAFK.getAllListeners()).length).to.equal(2);
    });
  });

  describe('addListener', () => {
    it('should create a new AFK listener', () => {
      global.sandbox.stub(Listener.prototype, 'checkIsAway').returns();

      const listenerId = NodeAFK.addListener(1, () => {});

      const listeners = NodeAFK.getAllListeners();

      expect(Object.keys(listeners).length).to.equal(1);

      const listener = listeners[listenerId];

      expect(typeof listener).to.equal('object');
      /* eslint-disable-next-line */
      expect(listener instanceof Listener).to.be.true;
      expect(listener.checkIsAway.callCount).to.equal(1);
    });
  });

  describe('removeListener', () => {
    it('should remove a listener by its id', () => {
      const newListener = new Listener();
      global.sandbox.spy(newListener, 'stop');
      const listenerId = 1;

      NodeAFK.listeners[listenerId] = newListener;

      expect(Object.keys(NodeAFK.getAllListeners()).length).to.equal(1);
      const listener = NodeAFK.getAllListeners()[listenerId];
      const result = NodeAFK.removeListener(listenerId);

      expect(result).to.be.true;
      expect(Object.keys(NodeAFK.getAllListeners()).length).to.equal(0);
      expect(listener.stop.callCount).to.equal(1);
    });

    it('should return false if a listener could not be removed', () => {
      const result = NodeAFK.removeListener(999999);
      expect(result).to.be.false;
    });
  });

  describe('removeListener', () => {
    it('should remove all listeners', () => {
      const firstListener = new Listener();
      const secondListener = new Listener();

      global.sandbox.spy(firstListener, 'stop');
      global.sandbox.spy(secondListener, 'stop');

      NodeAFK.listeners[1] = firstListener;
      NodeAFK.listeners[2] = secondListener;

      const listeners = NodeAFK.getAllListeners();

      expect(Object.keys(listeners).length).length.to.equal(2);

      NodeAFK.removeAllListeners();

      Object.values(listeners).forEach((listener) => {
        expect(listener.stop.callCount).to.equal(1);
      });

      expect(Object.keys(NodeAFK.getAllListeners()).length).to.equal(0);
    });
  });
});
