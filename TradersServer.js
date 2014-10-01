var TradersServer = function(opt){
	var _this = this;
	_.extend(this, opt);
	
	if(!this.repositorio){
		throw "El server traders debe conocer a un repositorio";
	}
	if(!Usuario.id){
		throw "El usuario debe estar loguado antes de inicializar el server de traders";
	}
	// pedidos
	vx.when({
		de: Usuario.id,
		para: Usuario.id,
		tipoDeMensaje: "traders.crearProducto"
	}, function(msg){
		var producto = _.clone(msg.datoSeguro);
		producto.tipo = "producto";
		_this.repositorio.save(producto);
		
        vx.send({
			responseTo: msg.idRequest,
            de: Usuario.id,
			para: msg.de,
            datoSeguro: {
                producto: producto
            }
        });
		vx.send({
            tipoDeMensaje:"traders.avisoDeNuevoProducto",
            de: Usuario.id,
            datoSeguro: {
                producto: producto
            }
        });
	});
	
	vx.when({
		para: Usuario.id,
		tipoDeMensaje: "traders.getDatosPersonales"
	}, function(msg){	
		var res_bus = _this.repositorio.load({
			tipo:"DatosPersonales"
		});
		var datos_personales;
		var resultado;
		if(res_bus.length==1) {
			datos_personales = res_bus[0];
			resultado: "encontrado"
		}else{
			resultado: "no_encontrado"
		}		
        vx.send({
			responseTo: msg.idRequest,
			para: msg.de,
			de: Usuario.id,
			datoSeguro: {
				resultado: resultado,
				datosPersonales: datos_personales
			} 
		});
	});
	
	vx.when({
		de: Usuario.id,
		para: Usuario.id,
		tipoDeMensaje: "traders.setDatosPersonales"
	}, function(msg){	
		var res_bus = _this.repositorio.load({
			tipo:"DatosPersonales"
		});
		var datos_personales;
		if(res_bus.length==1){
			datos_personales = res_bus[0];
			_.extend(datos_personales, msg.datoSeguro);
		}else{
			datos_personales = msg.datoSeguro;
		}	
		_this.repositorio.save(datos_personales);	
        vx.send({
			responseTo: msg.idRequest,
			de: Usuario.id,
			para: msg.id,
			datoSeguro: msg.datoSeguro
		});
		vx.send({
			tipoDeMensaje: "traders.avisoDecambioEnDatosPersonales",
			de: Usuario.id,
			datoSeguro: msg.datoSeguro
		});
	});
};