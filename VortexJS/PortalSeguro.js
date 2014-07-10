var PortalSeguro = function(opt){
	opt = opt||{};
	this.id = opt.id||"";
	this.firmarCon = opt.firmarCon;
	this.encriptarCon = opt.encriptarCon;
	this.validarCon = opt.validarCon;
	this.desencriptarCon = opt.desencriptarCon;
	this.lastRequest = 0;
	this.portal = new NodoPortalBidi();
	vx.router.conectarBidireccionalmenteCon(this.portal);
};

PortalSeguro.prototype.send = function(mensaje, callback){
	var _this = this; 
	
	mensaje.de = (mensaje.de || this.firmarCon) || Encriptador.claveAnonima;
	mensaje.para = (mensaje.para || this.encriptarCon) || Encriptador.claveAnonima;
	
	if(mensaje.datoSeguro){
		mensaje.datoSeguro = Encriptador.encriptarString(JSON.stringify(mensaje.datoSeguro), mensaje.para, mensaje.de);
	}	
	if(callback){
		mensaje.idRequest = this.id.toString() + "_" +(++this.lastRequest).toString();
		var portal_respuesta = new PortalSeguro();
		var id_pedido = this.when({
			filtro: {
				responseTo: mensaje.idRequest,
				para: mensaje.de
			},
			callback: function(objRespuesta){
				callback(objRespuesta);
				_this.portal.quitarPedido(id_pedido);
			},
			atenderMensajesPropios: true
		});
	}	
	
	this.portal.enviarMensaje(mensaje);
};

PortalSeguro.prototype.when = function(){	
    var filtro;
	var callback; 
	var atenderMensajesPropios = false;
	if(arguments.length == 2){
		filtro = arguments[0];
		callback = arguments[1];
	}
	if(arguments.length == 1){
		filtro = arguments[0].filtro;
		callback = arguments[0].callback;
		atenderMensajesPropios = arguments[0].atenderMensajesPropios;
	}	
	return this.portal.pedirMensajes({
		filtro: filtro,
		callback: function(mensaje){			
			if(mensaje.datoSeguro){	
				var desencriptarCon = (mensaje.para || this.desencriptarCon) || Encriptador.claveAnonima;
				var validarCon = (mensaje.de || this.validarCon) || Encriptador.claveAnonima;
				
				var dato_desencriptado = Encriptador.desEncriptarString(mensaje.datoSeguro, validarCon, desencriptarCon);
				if(dato_desencriptado === undefined) return;
				mensaje.datoSeguro = JSON.parse(dato_desencriptado);
				callback(mensaje);					
			} else {
				callback(mensaje);
			}
		},
		atenderMensajesPropios: atenderMensajesPropios
	}); 
};