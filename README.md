# node-afk

A simple module to get how long the user has been away for with **100% test coverage**. Also provides `away` and `back` status updates. Scroll down for API and Usage Example.

### Note: Node AFK 1.0.0 requires Node 8 + due to ES6 usage. Use 0.5.0 for Node < 8 ( 0.5.0 no longer supported)
---

## Install
```
npm install afk
```

This package contains Native Modules that need to be build using Node GYP;

On Linux, you need `libxss-dev` and `pkg-config`

---

## General Usage Example
```js
const afk = require('afk');

const timeUntilAway = 10;

const listenerId = afk.addListener(timeUntilAway, (result , error) {
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

Example
```js
const listeners = AFK.getAllListeners();

console.log(listeners);
/* Output
{
    1: Listener,
    2: Listener,
}
*/
```



### AFK.addListener(timeUntilAway, callback)

`timeUntilAway` - Seconds without activity to classify a user as away
`callback(data, error)` - Function that will be called when the user status changed.

`data` contains the id of the listener, the status and the time since last activity in seconds.

This function returns the ID of the listener that was created.

Example
```js
const listenerId = afk.addListener(timeUntilAway, (result , error) {
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

Example
```js
const listenerId = afk.addListener(....);

...

afk.removeListener(listenerId)
```

### AFK.removeAllListeners()
Unregisters and removes all registered listeners.

Example
```
const listenerOne = afk.addListener(....);
const listenerTwo = afk.addListener(....);

....

afk.removeAllListeners();
```

---

# Contributing
Contributions are always welcome. Make sure you write tests for anything you add or change. We also enforce AirBNB ESLint rules.

---

# License
`MIT`
