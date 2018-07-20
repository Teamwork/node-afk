# node-afk

Trigger an action when the presence status of the user changes.

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

const inactivityDuration = 1000 * 10; // the user will be considered `offline` after 10 seconds

const afk = new NodeAFK(inactivityDuration);

afk.init();

afk.on('away', () => {
  // the status of the user changed from `online` to `away`
});

afk.on('online', () => {
  // the status of the user changed from `away` to `online`
})
```

`node-afk` is an event emitter and emits the following events:

- `away` - the status of the user changed from `online` to `away`
- `online` - the status of the user changed from `away` to `online`
- `status-changed` - the status of the user changed. An object is passed to the listener for this event containing details of the previous and current status.

```js
afk.on('status-changed', (err, { previousStatus, currentStatus }) => {
  // `previousStatus` is the status of the user before it changed
  // `currentStatus` is the status of the user after it changed
})
```

You can unregister a listener from an event using the `off` method of the event emitter:

```js
afk.off('away', awayListener);
```

You can also setup a listener that is executed when the status of the user has been their current status for a certain duration:

```js
afk.on('away:5000', () => {
  // the user has been `away` for 5 seconds
});

afk.on('online:15000', () => {
  // the user has been `online` for 15 seconds
});
```

These events will be emitted each time the status of the user is changed.

## API

### constructor(inactivityDuration, [pollInterval], [initialStatus])

Create a new instance of `node-afk`

- `inactivityDuration` - How long (in `ms`) until the user can be inactive until they are considered as `away`
- `pollInterval` - How often (in `ms`) should `node-afk`  query the system to get the the amount of time that the user has been away for (`1000ms` by default)
- `initialStatus` - The initial status of the user (`away` or `online`, `online` by default)

### on(eventName, listener)

Register a listener on an event

- `eventName` - `away`, `online`, `status-changed`, `<status>:<time>`
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
