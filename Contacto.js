var Contacto = function(opt){
	var _this = this;
	_.extend(this, opt);
	
	var datos_guardados = localStorage.getItem(this.idUsuario + "_Contacto_" + this.id);	
	if(datos_guardados){
		_.extend(this, JSON.parse(datos_guardados));
	};
	
	this.change(function(){
		localStorage.setItem(_this.idUsuario + "_Contacto_" + _this.id, JSON.stringify(_this.resumenParaGuardar()));		
	});
	
	this.portal = vx.portal();
	this.portal.when({
		tipoDeMensaje:"traders.inventario",
		de: this.id
	}, function(mensaje){
		_this.inventario = mensaje.datoSeguro.inventario;
		_this.change();
	});

	this.portal.when({
		tipoDeMensaje:"traders.avisoDeProductoModificado",
		de: _this.id
	}, function(mensaje){
		var producto = _.findWhere(_this.inventario, {id: mensaje.datoSeguro.producto.id});
		if(producto === undefined) return;			
		producto = _.extend(producto, mensaje.datoSeguro.producto);

		_this.change();
	});

	this.portal.when({
		tipoDeMensaje:"traders.avisoDeNuevoProducto",
		de: _this.id
	}, function(mensaje){
		if(_.findWhere(_this.inventario, {id: mensaje.datoSeguro.producto.id})!== undefined) return;
		_this.inventario.push(mensaje.datoSeguro.producto);

		_this.change();
	});

	this.portal.when({
		tipoDeMensaje:"traders.avisoDeBajaDeProducto",
		de: _this.id
	}, function(mensaje){
		_this.inventario = $.grep(_this.inventario, function(prod){
			return prod.id != mensaje.datoSeguro.id_producto;
		});

		_this.change();
	});


	this.portal.when({
		tipoDeMensaje:"traders.trueque.oferta",
		para: Traders.usuario.id,
		de: _this.id
	}, function(mensaje){
		// el contacto debería coincidir, me ahorro recalcularlo, aviso por las dudas

		var trueque = Traders.trueques({
			id: mensaje.datoSeguro.trueque.id,
			contacto: _this
		})[0];

		if(!trueque){
			trueque = Traders.nuevoTrueque({
				id: mensaje.datoSeguro.trueque.id,
				contacto: _this
			});
		}

		trueque.estado = 'ABIERTO'

		var oferta = mensaje.datoSeguro.oferta;


		oferta.ofertante = 'CONTACTO';
		oferta.estado = 'RECIBIDA';


		var aux_doy = oferta.doy;
		oferta.doy = oferta.recibo;
		oferta.recibo = aux_doy;


		trueque.ofertas.push(oferta);

		_this.change();
	});


	this.portal.when({
		tipoDeMensaje:"traders.aceptacionDeTrueque",
		para: Traders.usuario.id,
		de: _this.id
	}, function(mensaje){

		var trueque = Traders.trueques({
			id: mensaje.datoSeguro.trueque.id,
			contacto: _this
		})[0];

		trueque.ofertaDetallada = mensaje.datoSeguro.ofertaDetallada;

		var aux_doy = trueque.ofertaDetallada.doy;
		trueque.ofertaDetallada.doy = trueque.ofertaDetallada.recibo;
		trueque.ofertaDetallada.recibo = aux_doy;


		trueque.estado = "CERRADO";

		vx.send({
			tipoDeMensaje:"traders.aceptacionDeTrueque.handShake",
			para: _this.id,
			de: Traders.usuario.id,
			datoSeguro:{
				trueque: {id : trueque.id}
			}
		});


		Traders._concretarTrueque(trueque);

		_this.change();
	});


	this.portal.when({
		tipoDeMensaje:"traders.aceptacionDeTrueque.handShake",
		para: Traders.usuario.id,
		de: _this.id
	}, function(mensaje){

		var trueque = Traders.trueques({
			id: mensaje.datoSeguro.trueque.id,
			contacto: _this
		})[0];

		Traders._concretarTrueque(trueque);

		_this.change();
	});


	this.portal.when({
		tipoDeMensaje:"traders.avisoDeCambioDeAvatar",
		de: _this.id
	}, function(mensaje){
		_this.avatar = mensaje.datoSeguro.avatar;
		_this.change();
	});
	
	this.change();
};
Contacto.prototype.change= function(){
	var _this = this;
	if(!this._change) this._change = new Evento();
	if(_.isFunction(arguments[0])){		
		return this._change.addHandler(arguments[0]);			
	}else{
		this._change.disparar();
	}		
};
Contacto.prototype.alEliminar= function(){
	var _this = this;
	if(!this._alEliminar) this._alEliminar = new Evento();
	if(_.isFunction(arguments[0])){		
		return this._alEliminar.addHandler(arguments[0]);			
	}else{
		this._alEliminar.disparar();
	}		
};
Contacto.prototype.eliminar= function(){
	this.portal.desconectar();
	this.alEliminar();
};
Contacto.prototype.resumenParaGuardar= function(){
	return {
		id:this.id,
		idUsuario: this.idUsuario,
		estado: this.estado,
		nombre:this.nombre,
		inventario:this.inventario,
		avatar:this.avatar
	}
};