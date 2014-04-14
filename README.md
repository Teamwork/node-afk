node-afk
=========

Provides seconds since the user was last active

## Install
```
npm install afk
```

## Example
```javascript
var afk = require('afk');

var seconds = 10;

var listenerId = afk.addListener(seconds, function(e) {
	console.log(e)
	afk.removeListener(e.id);
})
```

## Notes
Linux support requires xprintidle otherwise returns 0

# Gotchas

- Module won't work in node-webkit on windows unless executable is named nw.exe. See this issue for rogerwang/node-webkit#199
