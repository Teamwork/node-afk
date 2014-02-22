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

setInterval(function(){
	afk.tick(function(ms){
		console.log(ms);
	});	
}, 1000)
```

## Notes
Linux support requires xprintidle otherwise returns 0