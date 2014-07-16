var VxString = function(opt){
	var defaults = {
		valor: ""
	};
	_.extend(this, defaults, opt)
	this.start();
};

VxString.prototype.start = function(){
	var _this = this;
	this._change_callbacks = [];
	this.portal = vx.portal();
	this.inicializado = false;
	
	this.portal.when({
		filtro:{
			tipoDeMensaje: "vortex.persistencia.change",
			idOwner: this.claveEscritura,
			idObjeto: this.idObjeto 
		},
		callback: function(mensaje){
			_this.valorEncriptado(mensaje.valorEncriptado, true);
		}
	});
	
	this.portal.when({
		filtro:{
			tipoDeMensaje: "vortex.persistencia.get",
			idOwner: this.claveEscritura,
			idObjeto: this.idObjeto 
		},
		callback: function(mensaje){
			if(_this.inicializado){ 	
				_this.portal.send({
					para: mensaje.de,
					responseTo: mensaje.idRequest,
					valorEncriptado: _this.valor_encriptado
				});
			}
		}
	});
	
	setTimeout(function(){
		_this.portal.send({
			tipoDeMensaje: "vortex.persistencia.get",
			idOwner: _this.claveEscritura,
			idObjeto: _this.idObjeto 
		}, function(mensaje){
			_this.valorEncriptado(mensaje.valorEncriptado, true);
		});
	}, 10);
};

VxString.prototype.val = function(valor, no_enviar_mensaje){
	var _this = this;
	if(valor === undefined){ 
		return this.valor;
  	};
	if(valor == this.valor) return;
	this.valor = valor;
	this.valor_encriptado = Encriptador.encriptarString(this.valor, this.claveLectura, this.claveEscritura)
	this.inicializado = true;
	
	this.change();
	if(!no_enviar_mensaje) this.enviarMensajeDeActualizacion();
};

VxString.prototype.valorEncriptado = function(valor_encriptado, no_enviar_mensaje){
	var _this = this;
	if(valor_encriptado === undefined){ 
		return this.valor_encriptado;
  	};
	if(valor_encriptado == this.valor_encriptado) return;
	this.valor_encriptado = valor_encriptado;
	this.valor = Encriptador.desEncriptarString(this.valor_encriptado, this.claveEscritura, this.claveLectura);
	this.inicializado = true;
	
	this.change();
	if(!no_enviar_mensaje) this.enviarMensajeDeActualizacion();
};

VxString.prototype.enviarMensajeDeActualizacion = function(){
	this.portal.send({
		tipoDeMensaje: "vortex.persistencia.change",
		idOwner: this.claveEscritura,
		idObjeto: this.idObjeto,
		valorEncriptado: this.valor_encriptado
	});
};

VxString.prototype.change = function(callback){
	var _this = this;
	if(callback){		
		this._change_callbacks.push(callback);			
	}else{
		_.each(this._change_callbacks, function(evento){
			evento();
		});
	}
};