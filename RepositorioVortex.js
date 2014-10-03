var RepositorioVortex = {
	start: function(opt){
		var _this = this;
		_.extend(this, opt);	
		
		if(!this.repositorio){
			throw "El repositorio vortex debe conocer a un repositorio fisico";
		}
		if(!Usuario.id){
			throw "El usuario debe estar loguado antes de inicializar el repositorio vortez";
		}
		
		vx.when({
			de: Usuario.id,
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.insert"
		}, function(msg){
			var obj = _.clone(msg.datoSeguro.objeto);
			_this.repositorio.insert(obj);

			vx.send({
				responseTo: msg.idRequest,
				de: Usuario.id,
				para: msg.de,
				datoSeguro: {
					resultado: "success",
					idObjeto: obj.id
				}
			});
			vx.send({
				tipoDeMensaje: "vortex.persistencia.avisoDeObjetoNuevo",
				de: Usuario.id,
				tipoDeObjeto: obj.tipo,
				datoSeguro: {
					objeto: obj
				}
			});
		});

        this.repositorio.onObjetoInsertado(function(){
            vx.send({
				tipoDeMensaje: "vortex.persistencia.avisoDeObjetoNuevo",
				de: Usuario.id,
				tipoDeObjeto: obj.tipo,
				datoSeguro: {
					objeto: obj
				}
			});
        });
        
		vx.when({
			de: Usuario.id,
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.update"
		}, function(msg){
			var objetos_actualizados = _this.repositorio.update(msg.datoSeguro.filtro, msg.datoSeguro.cambios);	
			_.forEach(objetos_actualizados, function(obj){
				vx.send({
					tipoDeMensaje:"vortex.persistencia.avisoDeObjetoActualizado",
					de: Usuario.id,
					idObjeto: obj.id,
					tipoDeObjeto: obj.tipo,
					datoSeguro: {
						cambios: msg.datoSeguro.cambios
					}
				});
			});

			vx.send({
				responseTo: msg.idRequest,
				de: Usuario.id,
				para: msg.de,
				datoSeguro: {
					resultado: "success"
				}
			});
		});

        this.repositorio.onObjetoActualizado(function(){
            vx.send({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoActualizado",
                de: Usuario.id,
                idObjeto: obj.id,
                tipoDeObjeto: obj.tipo,
                datoSeguro: {
                    cambios: msg.datoSeguro.cambios
                }
            });
        });
        
		vx.when({
			de: Usuario.id,
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.delete"
		}, function(msg){
			var obj_borrados =_this.repositorio.remove(msg.datoSeguro.filtro);
			_.forEach(obj_borrados, function(obj){
				vx.send({
					tipoDeMensaje:"vortex.persistencia.avisoDeObjetoEliminado",
					de: Usuario.id,
					idObjeto: obj.id,
					tipoDeObjeto: obj.tipo,
					datoSeguro: {
						idObjeto: obj.id	//pa poner algo nomá
					}
				});				
			});
			vx.send({
				responseTo: msg.idRequest,
				de: Usuario.id,
				para: msg.de,
				datoSeguro: {
					resultado: "success"
				}
			});			
		});

        this.repositorio.onObjetoEliminado(function(){
            vx.send({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoEliminado",
                de: Usuario.id,
                idObjeto: obj.id,
                tipoDeObjeto: obj.tipo,
                datoSeguro: {
                    idObjeto: obj.id	//pa poner algo nomá
                }
            });		
        });
        
		vx.when({
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.select"
		}, function(msg){	
			var objetos = _this.repositorio.select(msg.datoSeguro.filtro);
			
			vx.send({
				responseTo: msg.idRequest,
				para: msg.de,
				de: Usuario.id,
				datoSeguro: {
					objetos: objetos
				} 
			});
		});
        
        
	}
};