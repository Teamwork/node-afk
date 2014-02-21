node-idle
=========

Provides seconds since the user was last active

## Install
```
npm install node-idle
```

## Example
```javascript
var idle = require('idle');

setInterval(function(){
	idle.tick(function(ms){
		console.log(ms);
	});	
}, 1000)
```

## Notes
Currently just returns 0 when run on linux. Sooon..
