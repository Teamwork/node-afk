const desktopIdle = require('desktop-idle');
const EventEmitter = require('events');

const STATUS_IDLE = 'idle';
const STATUS_ACTIVE = 'active';

/**
 * NodeAFK
 *
 * @extends EventEmitter
 */
class NodeAFK extends EventEmitter {
  /**
   * Create a new instance of NodeAFK
   * @param {number} inactivityDuration The duration until the user is considered `idle` (in ms)
   * @param {number} pollInterval How often should NodeAFK poll the system to
   * get the current idle time (in ms)
   * @param {string} initialStatus The initial status of the user
   */
  constructor(
    inactivityDuration,
    pollInterval = 1000,
    initialStatus = STATUS_ACTIVE,
  ) {
    super();

    this.inactivityDuration = inactivityDuration;
    this.pollInterval = pollInterval;
    this.pollIntervalId = undefined;
    this.timedEvents = [];
    this.userLastActiveAt = undefined;

    this.setStatus(initialStatus);
  }

  /**
   * Set the current status for the user
   * @param {string} status The new status for the user
   * @throws Will throw an error when an invalid status is provided
   * @public
   */
  setStatus(status) {
    if (![STATUS_IDLE, STATUS_ACTIVE].includes(status)) {
      throw new Error(`${status} is not a valid status`);
    }

    if (status === STATUS_ACTIVE) {
      this.userLastActiveAt = Date.now();
    }

    this.currentStatus = status;
  }

  /**
   * Initialise the NodeAFK instance:
   *  - Cleans up any existing poll intervals, timed events and event listeners
   *  - Sets up the poll interval
   * @public
   */
  init() {
    this.destroy();

    this.pollIntervalId = setInterval(
      this.pollStatus.bind(this),
      this.pollInterval,
    );
  }

  /**
   * Destroy the NodeAFK instance:
   *  - Stops the poll interval if it has been setup
   *  - Clears any timed events
   *  - Unregisters any registered event listeners
   * @public
   */
  destroy() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }

    this.timedEvents = [];

    this.removeAllListeners();
  }

  /**
   * Register an event listener on an event
   * @param {string} eventName Name of the event to register the listener to
   * @param {function} listener Function to be executed when the event is emitted
   * @public
   */
  on(eventName, listener) {
    const eventNameInfo = this.parseEventName(eventName);

    if (eventNameInfo.isTimedEvent) {
      this.timedEvents.push({
        status: eventNameInfo.status,
        duration: eventNameInfo.duration,
        listener,
      });
    }

    super.on(eventName, listener);
  }

  /**
   * Unregister an event listener that is registered on an event
   * @param {string} eventName Name of the event to unregister the listener from
   * @param {function} listener Listener to be unregistered
   * @public
   */
  off(eventName, listener) {
    const eventNameInfo = this.parseEventName(eventName);

    if (eventNameInfo.isTimedEvent) {
      this.timedEvents = this.timedEvents.filter(
        timedEvent => timedEvent.status === eventNameInfo.status
          && timedEvent.duration === eventNameInfo.duration
          && timedEvent.listener === listener,
      );
    }

    super.removeListener(eventName, listener);
  }

  /**
   * Poll the system to get the idle time for the user and emit any events required
   * @private
   */
  pollStatus() {
    const idleTime = desktopIdle.getIdleTime();

    if (this.currentStatus === STATUS_ACTIVE && idleTime >= this.inactivityDuration) {
      this.emit('status-change', {
        previousStatus: STATUS_ACTIVE,
        currentStatus: STATUS_IDLE,
      });

      this.emit('status:idle');

      this.setStatus(STATUS_IDLE);
    }

    if (this.currentStatus === STATUS_IDLE && idleTime < this.inactivityDuration) {
      this.emit('status-change', {
        previousStatus: STATUS_IDLE,
        currentStatus: STATUS_ACTIVE,
      });

      this.emit('status:active');

      this.setStatus(STATUS_ACTIVE);
    }

    this.timedEvents.forEach(({ status, duration }) => {
      let willEmitTimedEvent = false;

      if (
        this.currentStatus === STATUS_IDLE
        && this.currentStatus === status
        && (idleTime - this.inactivityDuration) >= duration
      ) {
        willEmitTimedEvent = true;
      }

      if (
        this.currentStatus === STATUS_ACTIVE
        && this.currentStatus === status
        && Date.now() - this.userLastActiveAt >= duration
      ) {
        willEmitTimedEvent = true;
      }

      if (willEmitTimedEvent) {
        this.emit(`${status}:${duration}`);
      }
    });
  }

  /**
   * Parse an event name to work out what type of event it is
   * @param {string} eventName Name of the event
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  parseEventName(eventName) {
    const eventNameInfo = {
      isTimedEvent: false,
      status: undefined,
      duration: undefined,
    };

    const eventNameExpression = new RegExp(`^(${STATUS_IDLE}|${STATUS_ACTIVE})(:([0-9]+))?$`);
    const eventNameParts = eventName.match(eventNameExpression);

    if (!eventNameParts) return eventNameInfo;

    let status = eventNameParts[0];
    const duration = eventNameParts[3];

    eventNameInfo.status = status;

    if (duration) {
      // eslint-disable-next-line prefer-destructuring
      status = eventNameParts[1];

      eventNameInfo.isTimedEvent = true;
      eventNameInfo.status = status;
      eventNameInfo.duration = Number(duration);
    }

    return eventNameInfo;
  }
}

module.exports = NodeAFK;
module.exports.STATUS_IDLE = STATUS_IDLE;
module.exports.STATUS_ACTIVE = STATUS_ACTIVE;
