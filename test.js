var idle = require('./index.js');

idle.tick(function(ms){
	console.log(ms);
});