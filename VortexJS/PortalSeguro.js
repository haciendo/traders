/*
Vortex by Vortex Group is licensed under a Creative Commons Reconocimiento 3.0 Unported License.
To view a copy of this licence, visit: http://creativecommons.org/licenses/by/3.0/
Project URL: https://sourceforge.net/p/vortexnet
*/


var PortalSeguro = function(opt){
	this.id = this._lastIdPortal;
    PortalSeguro.prototype._lastIdPortal+=1;
    
    if(opt){
	   this.claveLocal = opt.claveLocal;
	   this.claveForanea = opt.claveForanea;
    }
	this.lastRequest = 0;
	
    NodoPortalBidi.apply(this, [this.id.toString()]);
    
	vx.router.conectarBidireccionalmenteCon(this);
};

PortalSeguro.prototype = new NodoPortalBidi();

PortalSeguro.prototype._lastIdPortal = 0;

PortalSeguro.prototype.send = function(mensaje, callback){
	var _this = this; 
	
	mensaje.de = (mensaje.de || this.claveLocal) || Encriptador.claveAnonima;
	mensaje.para = (mensaje.para || this.claveForanea) || Encriptador.claveAnonima;
	
	var clave_firma = Encriptador.keys[mensaje.de];// || Encriptador.keys[Encriptador.claveAnonima];
	var clave_encriptacion = mensaje.para;
	
	if(mensaje.datoSeguro){
		mensaje.datoSeguro = Encriptador.encriptarString(JSON.stringify(mensaje.datoSeguro), clave_encriptacion, clave_firma);
	}
	
	this.enviarMensaje(mensaje);
	
	if(callback){
		mensaje.idRequest = this.id.toString() + "_" +(++this.lastRequest).toString();
		var id_pedido = this.when({
			responseTo: mensaje.idRequest,
			para: mensaje.de
		},function(objRespuesta){
			callback(objRespuesta);
			_this.quitarPedido(id_pedido);
		});
	}		
};

PortalSeguro.prototype.when = function(){	
    var filtro;
	var callback; 
	if(arguments.length == 2){
		filtro = arguments[0];
		callback = arguments[1];
	}
	if(arguments.length == 1){
		filtro = arguments[0].filtro;
		callback = arguments[0].callback;
	}	
    
	if(this.claveLocal) filtro.para = filtro.para || this.claveLocal;
	if(this.claveForanea) filtro.de = filtro.de || this.claveForanea;
	
	this.pedirMensajes({
		filtro: filtro,
		callback: function(mensaje){			
			if(mensaje.datoSeguro){	
				var clave_desencriptado = Encriptador.keys[mensaje.para];
				var clave_validacion_firma = mensaje.de;
				
				var dato_desencriptado = Encriptador.desEncriptarString(mensaje.datoSeguro, clave_validacion_firma, clave_desencriptado);
				if(dato_desencriptado === undefined) return;
				mensaje.datoSeguro = JSON.parse(dato_desencriptado);
				callback(mensaje);					
			} else {
				callback(mensaje);
			}
		}
	}); 
};