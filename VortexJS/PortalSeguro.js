var PortalSeguro = function(){
	var opt = getArguments(arguments, {
		id: "",
		firmarCon: Encriptador.claveAnonima,
		encriptarCon: Encriptador.claveAnonima,
		validarCon: Encriptador.claveAnonima,
		desencriptarCon: Encriptador.claveAnonima
	});
	_.extend(this, opt);

	this.portal = new NodoPortalBidi();
	vx.router.conectarBidireccionalmenteCon(this.portal);
};

PortalSeguro.prototype.send = function(){
	var _this = this; 
	
	var opt = getArguments(arguments, {
		mensaje: {},
		callback: undefined
	});
	
	opt.mensaje.de = opt.mensaje.de || this.firmarCon;
	opt.mensaje.para = opt.mensaje.para || this.encriptarCon;
	
	if(opt.mensaje.datoSeguro){
		opt.mensaje.datoSeguro = Encriptador.encriptarString(JSON.stringify(opt.mensaje.datoSeguro), opt.mensaje.para, opt.mensaje.de);
	}	
	var pedido;
	if(opt.callback){
		opt.mensaje.idRequest = this.id.toString() + "_" + randomString(32);
		var portal_respuesta = new PortalSeguro();
		pedido = this.when({
			filtro: {
				responseTo: opt.mensaje.idRequest,
				para: opt.mensaje.de
			},
			callback: function(objRespuesta){
				opt.callback(objRespuesta);
				pedido.quitar();
			},
			atenderMensajesPropios: true
		});
	}	
	
	this.portal.enviarMensaje(opt.mensaje);
	return pedido;
};

PortalSeguro.prototype.when = function(){	
	var _this = this;
	var opt = getArguments(arguments, {
		filtro:{},
		callback: function(){},
		atenderMensajesPropios: false
	});
	var callback = opt.callback;
	opt.callback = function(mensaje){			
		if(mensaje.datoSeguro){	
			var desencriptarCon = mensaje.para || this.desencriptarCon;
			var validarCon = mensaje.de || this.validarCon;

			var dato_desencriptado = Encriptador.desEncriptarString(mensaje.datoSeguro, validarCon, desencriptarCon);
			if(dato_desencriptado === undefined) return;
			mensaje.datoSeguro = JSON.parse(dato_desencriptado);
			callback(mensaje);					
		} else {
			callback(mensaje);
		}
	};
	
	var id_pedido = this.portal.pedirMensajes(opt);
	return {
		quitar: function(){
			_this.portal.quitarPedido(id_pedido);
		}
	}
};