# node-afk

Trigger an action when the activity status of the user changes.

## Prerequisites

- Node.js >= 8.0.0

## Installation

```sh
npm install afk
```

This module uses a native module that needs to be built using `node-gyp`.

On linux you will need to install `libxss-dev` and `pkg-config` to ensure that the native module dependency can be built.

## Usage

```js
const NodeAFK = require('node-afk');

const inactivityDuration = 1000 * 10; // the user will be considered `idle` after 10 seconds

const afk = new NodeAFK(inactivityDuration);

afk.init();

afk.on('status:idle', () => {
  // the status of the user changed from `active` to `idle`
});

afk.on('status:active', () => {
  // the status of the user changed from `idle` to `active`
})
```

`node-afk` is an event emitter and emits the following events:

- `status:idle` - the status of the user changed from `active` to `idle`
- `status:active` - the status of the user changed from `idle` to `active`
- `status-changed` - the status of the user changed. An object is passed to the listener for this event containing details of the previous and current status.
- `error` - an error occured

```js
afk.on('status-changed', (err, { previousStatus, currentStatus }) => {
  // `previousStatus` is the status of the user before it changed
  // `currentStatus` is the status of the user after it changed
})
```

You can unregister a listener from an event using the `off` method of the event emitter:

```js
afk.off('status:idle', idleListener);
```

You can also setup a listener that is executed when the status of the user has been their current status for a certain duration:

```js
afk.on('idle:5000', () => {
  // the user has been `idle` for 5 seconds
});

afk.on('active:15000', () => {
  // the user has been `active` for 15 seconds
});
```

These events will be emitted each time the status of the user is changed.

If an error occurs whilst trying to retrieve the idle time from the system an `error` event will be emitted:

```js
afk.on('error', (err) => {
  // an error occurred
});
```

## API

### constructor(inactivityDuration, [pollInterval])

Create a new instance of `node-afk`

- `inactivityDuration` - How long (in `ms`) until the user can be inactive until they are considered as `idle`
- `pollInterval` - How often (in `ms`) should `node-afk`  query the system to get the the amount of time that the user has been away for (`1000ms` by default)

### on(eventName, listener)

Register a listener on an event

- `eventName` - `status:active`, `status:idle`, `status-changed`, `<status>:<time>`, `error`
- `listener` - Function to be executed when the event is emitted

### off(eventName, listener)

Unregister a listener from an event

- `eventName` - The name of the event
- `listener` - The listener associated with the event

### init()

Initalise the `node-afk` instance. 

**This is required to be called so that the poll interval is setup.**

### destroy()

Stops the poll interval and removes all event listeners.

## Contributing

Contributions are always welcome. Make sure you write tests for anything you add or change. We also enforce AirBNB ESLint rules.

## License

`MIT`
