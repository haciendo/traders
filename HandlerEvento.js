var HandlerEvento = function(id, callback, evento){
	this.id = id;
	this.callback = callback;
	this.evento = evento;
};

HandlerEvento.prototype.quitar = function(){
	this.evento.removeHandler(this.id);
	this.callback = undefined;
};