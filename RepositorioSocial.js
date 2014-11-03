var RepositorioSocial = {
	start: function(opt){
		var _this = this;
		_.extend(this, opt);	
		
		if(!this.repositorio){
			throw "El repositorio vortex debe conocer a un repositorio fisico";
		}
		if(!Usuario.id){
			throw "El usuario debe estar loguado antes de inicializar el repositorio vortez";
		}
		
        this.pedidos = this.repositorio.select({
            tipo: "vortex.persistencia.pedido"
        });
        
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
		});

        this.repositorio.onObjetoInsertado(function(obj){
             _.forEach(_this.pedidos, function(pedido){                
                if(_this.elObjetoPasaElFiltro(obj, pedido.filtro)) {       
                    vx.send({
                        tipoDeMensaje: "vortex.persistencia.avisoDeObjetoAgregadoAPedido",
                        de: Usuario.id,
                        para: pedido.idUsuario,
                        idPedido: pedido.id,
                        datoSeguro: {
                            objeto: obj
                        }
                    });	   
                }
            });
        });
        
		vx.when({
			de: Usuario.id,
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.update"
		}, function(msg){
			_this.repositorio.update(msg.datoSeguro.filtro, msg.datoSeguro.cambios);	
			vx.send({
				responseTo: msg.idRequest,
				de: Usuario.id,
				para: msg.de,
				datoSeguro: {
					resultado: "success"
				}
			});
		});

        this.repositorio.onObjetoActualizado(function(obj_old, obj_new, cambios){
            _.forEach(_this.pedidos, function(pedido){                
                var el_objeto_pasaba_el_filtro = _this.elObjetoPasaElFiltro(obj_old, pedido.filtro);
                var el_objeto_pasa_el_filtro = _this.elObjetoPasaElFiltro(obj_new, pedido.filtro);
                
                if(el_objeto_pasaba_el_filtro && el_objeto_pasa_el_filtro) {       
                    vx.send({
                        tipoDeMensaje: "vortex.persistencia.avisoDeObjetoModificadoEnPedido",
                        de: Usuario.id,
                        para: pedido.idUsuario,
                        idPedido: pedido.id,
                        datoSeguro: {
                            idObjeto: obj_new.id,
                            cambios: cambios
                        }
                    });	   
                }
                if(!el_objeto_pasaba_el_filtro && el_objeto_pasa_el_filtro) {       
                    vx.send({
                        tipoDeMensaje: "vortex.persistencia.avisoDeObjetoAgregadoAPedido",
                        de: Usuario.id,
                        para: pedido.idUsuario,
                        idPedido: pedido.id,
                        datoSeguro: {
                            objeto: obj_new
                        }
                    });	   
                }
                if(el_objeto_pasaba_el_filtro && !el_objeto_pasa_el_filtro) {       
                    vx.send({
                        tipoDeMensaje: "vortex.persistencia.avisoDeObjetoQuitadoDePedido",
                        de: Usuario.id,
                        para: pedido.idUsuario,
                        idPedido: pedido.id,
                        datoSeguro: {
                            idObjeto: obj_new.id
                        }
                    });	   
                }                   
            });
        });
        
		vx.when({
			de: Usuario.id,
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.delete"
		}, function(msg){
			_this.repositorio.remove(msg.datoSeguro.filtro);
			vx.send({
				responseTo: msg.idRequest,
				de: Usuario.id,
				para: msg.de,
				datoSeguro: {
					resultado: "success"
				}
			});			
		});

        this.repositorio.onObjetoEliminado(function(obj){
            _.forEach(_this.pedidos, function(pedido){
                if(_this.elObjetoPasaElFiltro(obj, pedido.filtro)) {   //el objeto pasaba el filtro
                    vx.send({
                        tipoDeMensaje:"vortex.persistencia.avisoDeObjetoEliminado",
                        de: Usuario.id,
                        para: pedido.idUsuario,
                        idPedido: obj.id,
                        datoSeguro: {
                            idObjeto: obj.id
                        }
                    });	 
                    
                    vx.send({
                        tipoDeMensaje: "vortex.persistencia.avisoDeObjetoQuitadoDePedido",
                        de: Usuario.id,
                        para: pedido.idUsuario,
                        idPedido: pedido.id,
                        datoSeguro: {
                            idObjeto: obj.id
                        }
                    });	   
                }
            });
        });
        
		vx.when({
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.select"
		}, function(msg){	            
			var objetos = _this.repositorio.select(pedido.filtro);
			
			vx.send({
				responseTo: msg.idRequest,
				para: pedido.idUsuario,
				de: Usuario.id,
				datoSeguro: {
                    idPedido: pedido.id,
					objetos: objetos
				} 
			});
		});
        
        vx.when({
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.agregarPedido"
		}, function(msg){	
            var pedido = _this.repositorio.insert({
                tipo: "vortex.persistencia.pedido",
                idUsuario: msg.de,
                filtro: msg.datoSeguro.filtro
            });
            _this.pedidos.push(pedido);
			var objetos = _this.repositorio.select(pedido.filtro);
			
			vx.send({
				responseTo: msg.idRequest,
				para: pedido.idUsuario,
				de: Usuario.id,
				datoSeguro: {
                    idPedido: pedido.id,
					objetos: objetos
				} 
			});
		});
        
		vx.when({
			para: Usuario.id,
			tipoDeMensaje: "vortex.persistencia.quitarPedido"
		}, function(msg){	
            var pedido = _this.repositorio.remove({
                id: msg.datoSeguro.idPedido
            });
			_this.pedidos = _.without(_this.pedidos, _.findWhere(_this.pedidos, {id: msg.datoSeguro.idPedido}));
		});
		
        vx.send({
			de:Usuario.id,
			tipoDeMensaje: "vortex.persistencia.avisoDeRepositorioOnline"
		});
	},
    elObjetoPasaElFiltro: function(objeto, filtro){
        return _.findWhere([objeto], filtro) !== undefined
    }
};