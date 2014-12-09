TradersServer = {
	start: function(opt){
		var _this = this;
		_.extend(this, opt);

		if(!Usuario.id){
			throw "El usuario debe estar logueado antes de inicializar el server de traders";
		}
		
		//mi onlineidad
		vx.when({
			tipoDeMensaje: "traders.estasOnline",
			para: Usuario.id
		}, function(pedido){
			vx.send({
				responseTo: pedido.idRequest,
				de: Usuario.id,
				para: pedido.datoSeguro.idSolicitante
			});
		}); 
		
		var enviar_aviso_de_conexion = function(){
			vx.send({
				tipoDeMensaje: "traders.estoyOnline",
				de: Usuario.id
			});
		};
		setInterval(function(){
			enviar_aviso_de_conexion();
		}, 10000);		
		enviar_aviso_de_conexion();
		
		
		//Onlineidad de mis contactos
		var misContactos = BS.buscar({
			tipo: "Contacto", 
			idOwner: Usuario.id
	   	});
		misContactos.alAgregar(function(contacto){		
			contacto.online = false;				//asumo que está desconectado hasta que me avise
			vx.send({
				tipoDeMensaje: "traders.estasOnline",
				de: Usuario.id,
				para: contacto.idContacto,
				datoSeguro: {
					idSolicitante: Usuario.id
				}
			}, function(respuesta){
				contacto.online = true;
			}); 
			
			var muerte_contacto = setTimeout(function(){				
				contacto.online = false;
			}, 20000);
			vx.when({
				tipoDeMensaje: "traders.estoyOnline",
				de: contacto.idContacto
			}, function(msg){
				contacto.online = true;
				clearTimeout(muerte_contacto);
				muerte_contacto = setTimeout(function(){				
					contacto.online = false;
				}, 20000);
			});
		});			
	
		// Los contactos que no me confirmaron haber recibido mi solicitud de amistad
		BS.buscar({
			tipo: "Contacto", 
			idOwner: Usuario.id, 
			estadoSolicitud: "Enviando",
			online: true
	   	}).alAgregar(function(contacto){			
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
		});
		
		// Los contactos que no me confirmaron haber recibido mi aprobación de su solicitud de amistad
		BS.buscar({
			tipo: "Contacto", 
			idOwner: Usuario.id, 
			estadoSolicitud: "Aprobando",
			online: true
		}).alAgregar(function(contacto){
			vx.send({
				tipoDeMensaje: "traders.aprobarSolicitudDeAmistad",
				de: Usuario.id,
				para: contacto.idContacto
			}, function(respuesta){
				if(respuesta.datoSeguro.resultado == "success"){
					contacto.estadoSolicitud = "Aprobada";
				}
			}); 
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
					online:true,
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