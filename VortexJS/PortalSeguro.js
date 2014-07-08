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
	
	this.portal.enviarMensaje(mensaje);
	
	if(callback){
		mensaje.idRequest = this.id.toString() + "_" +(++this.lastRequest).toString();
		var id_pedido = this.when({
			responseTo: mensaje.idRequest,
			para: mensaje.de
		},function(objRespuesta){
			callback(objRespuesta);
			_this.portal.quitarPedido(id_pedido);
		});
	}		
};

PortalSeguro.prototype.when = function(p){	
	this.portal.pedirMensajes({
		filtro: p.filtro,
		callback: function(mensaje){			
			if(mensaje.datoSeguro){	
				var desencriptarCon = (mensaje.para || this.desencriptarCon) || Encriptador.claveAnonima;
				var validarCon = (mensaje.de || this.validarCon) || Encriptador.claveAnonima;
				
				var dato_desencriptado = Encriptador.desEncriptarString(mensaje.datoSeguro, validarCon, desencriptarCon);
				if(dato_desencriptado === undefined) return;
				mensaje.datoSeguro = JSON.parse(dato_desencriptado);
				p.callback(mensaje);					
			} else {
				p.callback(mensaje);
			}
		}
	}); 
};