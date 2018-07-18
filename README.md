# node-afk

A simple module to get how many seconds the user has been away for with **100% test coverage**. Also provides `away` and `back` status updates. Scroll down for API and Usage Example.

### Note: Node AFK 1.0.0 requires Node >= 8 due to ES6 usage. Use 0.5.0 for Node < 8 ( 0.5.0 no longer supported)
---

## Install
```
npm install afk
```

This package contains native modules that need to be built using node-gyp.

On linux you will need to install `libxss-dev` and `pkg-config` to build this module.

---

## General Usage Example
```js
const afk = require('afk');

const secondsUntilAway = 10; // 10 seconds

const listenerId = afk.addListener(secondsUntilAway, (error, result) {
    if (error) {
        console.error(error);
    } else {
        console.log(`User Status: ${result.status}`);
        console.log(`Time since last activity: ${result.time}`);
    }
});
```

---

## Public API

### AFK.getAllListeners()

Returns an Object containing all registered AFK listeners.

```js
const afk = require('afk');

const listeners = afk.getAllListeners();

console.log(listeners);
/* Output
{
    1: Listener,
    2: Listener,
}
*/
```

### AFK.addListener(secondsUntilAway, callback)

- `secondsUntilAway` - Seconds without activity to classify a user as away

- `callback(error, data)` - Function that will be called when the user status changed.

    - `data` will be an `object` that contains the properties:

        - `id` - The ID of the listener
        - `status` - The users status (`online`, `offline`, `away`)
        - `time` - The number of seconds since the user was last active

This function returns the ID of the listener that was created.

```js
const afk = require('afk');

const listenerId = afk.addListener(10, (error, result) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`User Status: ${result.status}`);
        console.log(`Time since last activity: ${result.time}`);
    }
});
```

### AFK.removeListener(listenerId)

Unregisters and removes a registered listener given its ID.

Returns a boolean specifying if the listener was successfully removed.

```js
const afk = require('afk');

const listenerId = afk.addListener(...);

...

afk.removeListener(listenerId);
```

### AFK.removeAllListeners()

Unregisters and removes all registered listeners.

```js
const listenerOne = afk.addListener(...);
const listenerTwo = afk.addListener(...);

...

afk.removeAllListeners();
```

---

# Contributing

Contributions are always welcome. Make sure you write tests for anything you add or change. We also enforce AirBNB ESLint rules.

---

# License
`MIT`
