var Evento = function(unico){
	this._unico = unico;
	this._handlers = [];
	this._ultimo_id_handler = 0;
};

Evento.prototype.addHandler = function(callback){
	var _this = this;
	var handler = new HandlerEvento(this.ultimo_id_handler, callback, this);
	this._handlers.push(handler);
	this.ultimo_id_handler++;
	if(this._unico && this._ya_disparo) setTimeout(function(){ handler.callback.apply(_this, _this._argumentos_disparo);},0);
	return handler;
};

Evento.prototype.removeHandler = function(id_handler){
	this._handlers = _.reject(this._handlers, function(handler){return handler.id == id_handler;});
};

Evento.prototype.disparar = function(){
	var args = arguments;
	_.each(this._handlers, function(handler){
		setTimeout(function(){
			handler.callback.apply(this, args);
		},0);
	});
	this._ya_disparo = true;
	this._argumentos_disparo = arguments;
};

Evento.agregarEventoA = function(objeto_target, nombre_evento, evento_unico){
	if(objeto_target[nombre_evento]) return;
	objeto_target["_"+nombre_evento] = new Evento(evento_unico);
	objeto_target[nombre_evento] = function(){
		if(_.isFunction(arguments[0])){		
			return objeto_target["_"+nombre_evento].addHandler(arguments[0]);			
		}else{
			objeto_target["_"+nombre_evento].disparar.apply(objeto_target["_"+nombre_evento], arguments);
		}	
	}	
};