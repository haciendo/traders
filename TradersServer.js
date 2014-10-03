TradersServer = {
	start: function(opt){
		var _this = this;
		_.extend(this, opt);

		if(!this.repositorio){
			throw "El server traders debe conocer a un repositorio";
		}
		if(!Usuario.id){
			throw "El usuario debe estar loguado antes de inicializar el server de traders";
		}
		// pedidos    
//		vx.when({
//			de: Usuario.id,
//			para: Usuario.id,
//			tipoDeMensaje: "traders.enviarSolicitudDeAmistad"
//		}, function(msg){
//	        vx.send({
//				responseTo: msg.idRequest,
//	            de: Usuario.id,
//				para: msg.de,
//	            datoSeguro: {
//	                resultado:"success"
//	            }
//	        });
//			vx.send({
//	            tipoDeMensaje:"traders.solicitudDeAmistad",
//	            de: Usuario.id,
//                para: msg.datoSeguro.idContacto,
//	            datoSeguro: {
//	                idSolicitante: Usuario.id
//	            }
//	        });    
//            _this.repositorio.insert({
//                tipo: "SolicitudDeAmistadEnviada",
//                idContacto: msg.datoSeguro.idContacto
//            });
//		});
//        
//        vx.when({
//			para: Usuario.id,
//			tipoDeMensaje: "traders.solicitudDeAmistad"
//		}, function(msg){ 
//            _this.repositorio.insert({
//                tipo: "SolicitudDeAmistadRecibida",
//                idContacto: msg.datoSeguro.idContacto
//            });
//		});
//        
//        vx.when({
//            de: Usuario.id,
//			para: Usuario.id,
//			tipoDeMensaje: "traders.aceptarSolicitudDeAmistad"
//		}, function(msg){ 
//            var solicitud = _this.repositorio.remove({
//                id: msg.datoSeguro.idSolicitud
//            })[0];
//            _this.repositorio.insert({
//                tipo: "Contacto",
//                idContacto: solicitud.idContacto
//            });            
//		});
	}
};