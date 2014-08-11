var Inventario = function(idOwner, idLectura){
	var _this = this;
	this.idOwner = idOwner;
	this.idLectura = idLectura;
	
	this._altas = [];
	var str_altas_guardadas = Persistidor.get(this.idOwner + "_AltasDeProducto");	
	if(str_altas_guardadas){
		_this._cambios = JSON.parse(str_cambios_guardados);
		_.each(_this._cambios, function(cambio){
			//aplico los cambios (solo si puedo desencriptar y validar, si no tiro excepcion)
			_.extend(this, JSON.parse(Encriptador.desEncriptarString(cambio, this.idOwner, this.idLectura)));		
		});
	};
	
	var str_cambios_guardados = Persistidor.get(this.idOwner + "_Producto_" + this.id + "_cambios");	
	if(str_cambios_guardados){
		_this._cambios = JSON.parse(str_cambios_guardados);
		_.each(_this._cambios, function(cambio){
			//aplico los cambios (solo si puedo desencriptar y validar, si no tiro excepcion)
			_.extend(this, JSON.parse(Encriptador.desEncriptarString(cambio, this.idOwner, this.idLectura)));		
		});
		//tiro un change
		_this.change();
	};
	
	this.portal = vx.portal();
	this.portal.when({
		tipoDeMensaje: "Traders.modificacionDeProducto",
		id: this.id,
		idOwner: this.idOwner
	} function(mensaje){		
		//guardo los cambios
		_this._cambios.push(mensaje.cambio);	
		Persistidor.set(this.idOwner + "_Producto_" + this.id + "_cambios", _this._cambios); 
		//aplico los cambios (solo si puedo desencriptar y validar, si no tiro excepcion)
		_this._aplicarCambio(mensaje.cambio);
		//tiro un change
		_this.change();
	});
	
	this.portal.when({
		tipoDeMensaje: "Traders.bajaDeProducto",
		id: this.id,
		idOwner: this.idOwner
	} function(mensaje){	
		//si mensaje no es valido, me rajo
		if(JSON.parse(Encriptador.desEncriptarString(mensaje.baja, this.idOwner, this.idLectura)).id != _this.id) return; 
		_this.baja = mensaje.baja;
		Persistidor.set(this.idOwner + "_Producto_" + this.id + "_baja", mensaje.baja);
		_this.alEliminar();
	});
};

