var idle = require('./index.js');

setInterval(function(){
	idle.tick(function(ms){
		console.log(ms);
	});	
}, 1000)