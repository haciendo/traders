var Producto = function(alta, idOwner, claveLectura){
	var _this = this;
	this._modificaciones = [];
   
	this.idOwner = idOwner;
	this.claveLectura = claveLectura;
	 
    this.alta = JSON.parse(Encriptador.desEncriptarString(alta, this.idOwner, this.claveLectura));
	this.baja = false;
	
    _.extend(this, this.alta.valorInicial);		
    
	var str_datos_guardados = Persistidor.get(this.idOwner + "_Producto_" + this.id);	
	if(str_datos_guardados){
        var datos_guardados = JSON.parse(str_datos_guardados);
        _this._modificaciones = datos_guardados.modificaciones;
        _this._baja = datos_guardados.baja;
		_this.baja = (datos_guardados.baja !== undefined);
        _.each(_this._modificaciones, function(doc_modificacion){
            _this._aplicarCambio(doc_modificacion);
		});
		//tiro un change
		if(_this.baja) _this.alEliminar();
		_this.change();
	};
	
	vx.when({
		tipoDeMensaje: "Traders.modificacionDeProducto",
		idProducto: this.id,
		idOwner: this.idOwner
	}, function(mensaje){		
		_this._modificaciones.push(mensaje.docModificacion);	
		_this._aplicarCambio(mensaje.docModificacion);
		_this.change();
	});
	
	vx.when({
		tipoDeMensaje: "Traders.bajaDeProducto",
		idProducto: this.id,
		idOwner: this.idOwner
	}, function(mensaje){	
		//si mensaje no es valido, me rajo
		if(JSON.parse(Encriptador.desEncriptarString(mensaje.docBaja, _this.idOwner, _this.claveLectura)).idProducto != _this.id) return; 
		_this._baja = mensaje.docBaja;
		_this.baja = (_this._baja !== undefined);
		_this.alEliminar();
		_this.change();
	});
    
    this.change(function(){
        var resumen = {            
            modificaciones: _this._modificaciones,
            baja: _this._baja
        }
        Persistidor.set(_this.idOwner + "_Producto_" + _this.id, resumen); 
    });
};

Producto.prototype.modificar = function(cambio){
	//creo un certificado de modificacion, si no puedo crearlo tiro excepcion
	//envio el certificado por vortex, debería recibirlo yo mismo y todos los demas
    var docModificacion = {
        tipoDeDocumento: "Traders.altaDeProducto",
        idProducto: this.id,
        idOwner: this.idOwner,
        cambio: cambio
    };
    
    vx.send({
        tipoDeMensaje:"Traders.modificacionDeProducto",
		idProducto: this.id,
		idOwner: this.idOwner,
        docModificacion: Encriptador.encriptarString(JSON.stringify(docModificacion), this.claveLectura, this.idOwner)            
    });
};

Producto.prototype.eliminar= function(){
	//creo un certificado de baja, si no puedo crearlo tiro excepcion
	//envio el certificado por vortex, debería recibirlo yo mismo y todos los demas
	var docBaja = {
        tipoDeDocumento: "Traders.bajaDeProducto",
        idProducto: this.id,
        idOwner: this.idOwner
    };
    
    vx.send({
        tipoDeMensaje:"Traders.bajaDeProducto",
		idProducto: this.id,
		idOwner: this.idOwner,
        docBaja: Encriptador.encriptarString(JSON.stringify(docBaja), this.claveLectura, this.idOwner)            
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
Producto.prototype._aplicarCambio = function(doc_modificacion){
    var cambio = JSON.parse(Encriptador.desEncriptarString(doc_modificacion, this.idOwner, this.claveLectura)).cambio;
	_.extend(this, cambio);		
};