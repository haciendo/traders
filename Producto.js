var Producto = function(alta, idOwner, idLectura){
	var _this = this;
	this._cambios = [];
    
    this.alta = Encriptador.desEncriptarString(alta, this.claveLectura, this.idOwner));
    
	this.id = alta.idProducto;
	this.idOwner = alta.idOwner;
	this.claveLectura = alta.claveLectura;
	
    _.extend(this, JSON.parse(Encriptador.desEncriptarString(alta.valorInicial, this.idOwner, this.claveLectura)));		
    
	var str_baja_guardada = Persistidor.get(this.idOwner + "_Producto_" + this.id + "_baja");	
	if(str_baja_guardada){
		if(JSON.parse(Encriptador.desEncriptarString(str_baja_guardada, this.idOwner, this.claveLectura)).id != _this.id) return; 
		_this.baja = str_baja_guardada;
		_this.alEliminar();
	};
	
	var str_cambios_guardados = Persistidor.get(this.idOwner + "_Producto_" + this.id + "_cambios");	
	if(str_cambios_guardados){
		_this._cambios = JSON.parse(str_cambios_guardados);
		_.each(_this._cambios, function(cambio){
			//aplico los cambios (solo si puedo desencriptar y validar, si no tiro excepcion)
			_.extend(this, JSON.parse(Encriptador.desEncriptarString(cambio, this.idOwner, this.claveLectura)));		
		});
		//tiro un change
		_this.change();
	};
	
	vx.when({
		tipoDeMensaje: "Traders.modificacionDeProducto",
		id: this.id,
		idOwner: this.idOwner
	}, function(mensaje){		
		//guardo los cambios
		_this._cambios.push(mensaje.cambio);	
		Persistidor.set(this.idOwner + "_Producto_" + this.id + "_cambios", _this._cambios); 
		//aplico los cambios (solo si puedo desencriptar y validar, si no tiro excepcion)
		_this._aplicarCambio(mensaje.cambio);
		//tiro un change
		_this.change();
	});
	
	vx.when({
		tipoDeMensaje: "Traders.bajaDeProducto",
		id: this.id,
		idOwner: this.idOwner
	}, function(mensaje){	
		//si mensaje no es valido, me rajo
		if(JSON.parse(Encriptador.desEncriptarString(mensaje.baja, this.idOwner, this.claveLectura)).id != _this.id) return; 
		_this.baja = mensaje.baja;
		Persistidor.set(this.idOwner + "_Producto_" + this.id + "_baja", mensaje.baja);
		_this.alEliminar();
	});
};

Producto.prototype.modificar = function(cambio){
	//creo un certificado de modificacion, si no puedo crearlo tiro excepcion
	//envio el certificado por vortex, debería recibirlo yo mismo y todos los demas
	vx.send({
		tipoDeMensaje:"Traders.modificacionDeProducto",
		id: this.id,
		idOwner: this.idOwner,
		cambio: Encriptador.encriptarString(Json.stringify(cambio), this.idOwner, this.claveLectura)
	});
};

Producto.prototype.eliminar= function(){
	//creo un certificado de baja, si no puedo crearlo tiro excepcion
	//envio el certificado por vortex, debería recibirlo yo mismo y todos los demas
	vx.send({
		tipoDeMensaje:"Traders.bajaDeProducto",
		id: this.id,
		idOwner: this.idOwner,
		baja: Encriptador.encriptarString(Json.stringify({id: this.id}), this.idOwner, this.claveLectura)
	});
};

Producto.prototype.change= function(){
	var _this = this;
	if(!this._change) this._change = new Evento();
	if(_.isFunction(arguments[0])){		
		return this._change.addHandler(arguments[0]);			
	}else{
		this._change.disparar();
	}		
};
Producto.prototype.alEliminar= function(){
	var _this = this;
	if(!this._alEliminar) this._alEliminar = new Evento();
	if(_.isFunction(arguments[0])){		
		return this._alEliminar.addHandler(arguments[0]);			
	}else{
		this._alEliminar.disparar();
	}		
};
Producto.prototype._aplicarCambio = function(cambio){
	_.extend(this, JSON.parse(Encriptador.desEncriptarString(cambio, this.idOwner, this.claveLectura)));		
};