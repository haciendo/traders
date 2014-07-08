var PortalSeguro = function(opt){
	this.id = opt.id;
	this.claveLocal = opt.claveLocal;
	this.claveForanea = opt.claveForanea;
	this.lastRequest = 0;
	
	this.portal = new NodoPortalBidi();
	vx.router.conectarBidireccionalmenteCon(this.portal);
};

PortalSeguro.prototype.send = function(mensaje, callback){
	var _this = this; 
	
	mensaje.de = (mensaje.de || this.claveLocal) || Encriptador.claveAnonima;
	mensaje.para = (mensaje.para || this.claveForanea) || Encriptador.claveAnonima;
	
	var clave_firma = Encriptador.keys[mensaje.de];// || Encriptador.keys[Encriptador.claveAnonima];
	var clave_encriptacion = mensaje.para;
	
	if(mensaje.datoSeguro){
		mensaje.datoSeguro = Encriptador.encriptarString(JSON.stringify(mensaje.datoSeguro), clave_encriptacion, clave_firma);
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
	if(this.claveLocal) p.filtro.para = p.filtro.para || this.claveLocal;
	if(this.claveForanea) p.filtro.de = p.filtro.de || this.claveForanea;
	
	this.portal.pedirMensajes({
		filtro: p.filtro,
		callback: function(mensaje){			
			if(mensaje.datoSeguro){	
				var clave_desencriptado = Encriptador.keys[mensaje.para];
				var clave_validacion_firma = mensaje.de;
				
				var dato_desencriptado = Encriptador.desEncriptarString(mensaje.datoSeguro, clave_validacion_firma, clave_desencriptado);
				if(dato_desencriptado === undefined) return;
				mensaje.datoSeguro = JSON.parse(dato_desencriptado);
				p.callback(mensaje);					
			} else {
				p.callback(mensaje);
			}
		}
	}); 
};