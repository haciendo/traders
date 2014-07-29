var Evento = function(){
	this._handlers = [];
	this.ultimo_id_handler = 0;
};

Evento.prototype.addHandler = function(callback){
	var _this = this;
	var handler = new HandlerEvento(this.ultimo_id_handler, callback, this);
	this._handlers.push(handler);
	this.ultimo_id_handler++;
	return handler;
};

Evento.prototype.removeHandler = function(id_handler){
	this._handlers = _.reject(this._handlers, function(handler){return handler.id == id_handler;});
};

Evento.prototype.disparar = function(info){
	_.each(this._handlers, function(handler){
		handler.callback(info);
	});
};