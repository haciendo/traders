TradersServer = {
	start: function(opt){
		var _this = this;
		_.extend(this, opt);

		if(!Usuario.id){
			throw "El usuario debe estar logueado antes de inicializar el server de traders";
		}
		
		var misSolicitudesDeAmistad = BS.buscar({tipo: "SolicitudDeAmistad", idOwner: Usuario.id});        
		misSolicitudesDeAmistad.alAgregar(function(solicitud){
			if(solicitud.estado == "Enviando") {
				vx.send({
					tipoDeMensaje: "traders.solicitudDeAmistad",
					de: Usuario.id,
					para: solicitud.idContacto,
					datoSeguro: {
						idSolicitante: Usuario.id
					}
				}, function(respuesta){
					if(respuesta.datoSeguro.resultado == "success"){
						solicitud.estado = "Enviada";
					}
				}); 
			}
			
			if(solicitud.estado == "Aprobando") {
				vx.send({
					tipoDeMensaje: "traders.aprobarSolicitudDeAmistad",
					de: Usuario.id,
					para: solicitud.idContacto
				}, function(respuesta){
					if(respuesta.datoSeguro.resultado == "success"){
						solicitud.estado = "Aprobada";
					}
				}); 
			}
		});
		
		misSolicitudesDeAmistad.alCambiar(function(solicitud, cambios){
			if(!cambios.estado) return;
			if(cambios.estado == "Aprobando"){
				vx.send({
					tipoDeMensaje: "traders.aprobacionDeSolicitudDeAmistad",
					de: Usuario.id,
					para: solicitud.idContacto
				}, function(respuesta){
					if(respuesta.datoSeguro.resultado == "success"){
						solicitud.estado = "Aprobada";
					}
				}); 
			}
		});
//        
        vx.when({
			para: Usuario.id,
			tipoDeMensaje: "traders.solicitudDeAmistad"
		}, function(msg){ 
            if(!_.findWhere(misSolicitudesDeAmistad.resultados, {idContacto: msg.datoSeguro.idSolicitante})){
                misSolicitudesDeAmistad.insertar({
                    tipo: "SolicitudDeAmistad",
                    estado: "Recibida",
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
			var solicitud = _.findWhere(misSolicitudesDeAmistad.resultados, {idContacto: msg.de});
            solicitud.estado = "Aprobada"; 
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