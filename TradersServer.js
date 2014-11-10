TradersServer = {
	start: function(opt){
		var _this = this;
		_.extend(this, opt);

		if(!Usuario.id){
			throw "El usuario debe estar logueado antes de inicializar el server de traders";
		}
		
		var misContactos = BS.buscar({tipo: "Contacto", idOwner: Usuario.id});        
		misContactos.alAgregar(function(contacto){
			if(contacto.estado == "Enviando") {
				vx.send({
					tipoDeMensaje: "traders.solicitudDeAmistad",
					de: Usuario.id,
					para: contacto.idContacto,
					datoSeguro: {
						idSolicitante: Usuario.id
					}
				}, function(respuesta){
					if(respuesta.datoSeguro.resultado == "success"){
						contacto.estadoSolicitud = "Enviada";
					}
				}); 
			}
			
			if(contacto.estado == "Aprobando") {
				vx.send({
					tipoDeMensaje: "traders.aprobarSolicitudDeAmistad",
					de: Usuario.id,
					para: contacto.idContacto
				}, function(respuesta){
					if(respuesta.datoSeguro.resultado == "success"){
						contacto.estadoSolicitud = "Aprobada";
					}
				}); 
			}
		});
		
		misContactos.alCambiar(function(contacto, cambios){
			if(!cambios.estadoSolicitud) return;
			if(cambios.estadoSolicitud == "Aprobando"){
				vx.send({
					tipoDeMensaje: "traders.aprobacionDeSolicitudDeAmistad",
					de: Usuario.id,
					para: contacto.idContacto
				}, function(respuesta){
					if(respuesta.datoSeguro.resultado == "success"){
						contacto.estadoSolicitud = "Aprobada";
					}
				}); 
			}
		});
//        
        vx.when({
			para: Usuario.id,
			tipoDeMensaje: "traders.solicitudDeAmistad"
		}, function(msg){ 
            if(!_.findWhere(misContactos.resultados, {idContacto: msg.datoSeguro.idSolicitante})){
                misContactos.insertar({
                    tipo: "Contacto",
                    estadoSolicitud: "Recibida",
                    idContacto: msg.datoSeguro.idSolicitante
                });
            }			
			vx.send({
				responseTo: msg.idRequest,
				de: Usuario.id,
				para: msg.de,
				datoSeguro: {
					resultado: "success"
				}
			});
		});
//        
        vx.when({
			para: Usuario.id,
			tipoDeMensaje: "traders.aprobacionDeSolicitudDeAmistad"
		}, function(msg){             
			var solicitud = _.findWhere(misContactos.resultados, {idContacto: msg.de});
            contacto.estadoSolicitud = "Aprobada"; 
			vx.send({
				responseTo: msg.idRequest,
				de: Usuario.id,
				para: msg.de,
				datoSeguro: {
					resultado: "success"
				}
			});
		});
        
        
	}
};