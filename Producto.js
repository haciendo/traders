var Producto = function(opt){
	_.extend(this, opt);
	var _this = this;
	var datos_guardados = Persistidor.get(Usuario.id + "_Producto_" + this.id);	
	if(datos_guardados){
		_.extend(this, JSON.parse(datos_guardados));
	};
	this.change(function(){
		Persistidor.set(Usuario.id + "_Producto_" + _this.id, _this.resumenParaGuardar());		
	});
	this.change();
};
Producto.prototype.modificar = function(cambios){
	_.extend(this, cambios);
	
	vx.send({
		tipoDeMensaje:"traders.avisoDeProductoModificado",
		de: this.id,
		datoSeguro: {
			cambios: cambios
		}
	});
		
	this.change();  
},
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
Producto.prototype.eliminar= function(){
	//this.portal.desconectar();
	Persistidor.remove(Usuario.id + "_Producto_" + this.id)
	this.alEliminar();
};
Producto.prototype.resumenParaGuardar= function(){
	return {
		nombre:this.nombre,
		imagen:this.imagen
	}
};
Producto.prototype.resumenParaEnviar= function(){
	return {
		id:this.id,
		nombre:this.nombre,
		imagen:this.imagen
	}
};