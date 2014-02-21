node-idle
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
Currently just returns 0 when run on linux. Sooon..
