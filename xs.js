;function Ample(){
	this.ble = "bles";
	this.cles = "cles";
	this.nats = function(){
		console.log('this is name of nats function')
	}
};
Ample.prototype = function(){
	// some functions
}
Ample.prototype = {
	init:function(){
		// ...
	}
}