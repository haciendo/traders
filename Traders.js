var Traders = {
	usuario: Usuario,
	
    _onUsuarioLogueado:function(){},
	
	_onNovedades:[],
    
	onNovedades: function(){
		var _this = this;
		
		if(arguments.length==1){
			this._onNovedades.push(arguments[0]);
			
		}else{
			this.saveDataUsuario();
			
			_.each(this._onNovedades, function(evento){
				evento();
			});
		}
		
	},
	
    onUsuarioLogueado:function(callback){
        this._onUsuarioLogueado = callback;
    },
	
	
	nextTruequeId: function(){
		
		var maxValue = -1;
		
		_.each(this.trueques(), function(_trueque){
			if(_trueque.id > maxValue){
				maxValue = _trueque.id;
			}
		});
		
		maxValue++;
		
		return maxValue;
		
	},
	
    contactos:function(p){
		return Contactos.buscar(p);
    },
	
	reset: function(){
		this._trueques = [];
		this.usuario.inventario = [];
		
		this.saveDataUsuario();
	},
	
	login: function(_nombre, password){
        var _this = this;		
		var _id = Encriptador.addKey(_nombre + password);		
        Usuario.start({
            id: _id,
            nombre: _nombre
        });
        Contactos.start();     
		RepositorioDeConexiones.start(this.usuario.id);
        
        Contactos.change(function(){this.onNovedades()});
        Usuario.change(function(){this.onNovedades()});		
		
		////parche para atajar las respuestas
		vx.when({
			para: this.usuario.id
		}, function(mensaje){
			//nada-nop
        });
	
		//DEBUG
		vx.send({
			tipoDeMensaje	: "vortex.debug",
			descripcion		: "window.isphone: " + window.isphone,
			dato			: window.isphone
		});
		
        this._onUsuarioLogueado();
    },
	
    agregarProducto: function(p){	
        Usuario.agregarProducto(p);
    },
    
	modificarProducto: function(p){		
		Usuario.modificarProducto(p);
    },
    
    quitarProducto: function(producto){        
		Usuario.quitarProducto(producto);
    },
	
    agregarContacto: function(arg){
		return Contactos.agregar(arg);
    },
	
	quitarContacto: function(id){
		return Contactos.quitar(id);
	},
    
	_trueques:[],
    trueques:function(p){
        
		if(!p){
			return this._trueques;
		} else {
			return _.where(this._trueques, p);
		}
    },
	
	nuevoTrueque: function(opt){
		var _this = this;
		
		
		if(!opt.id){
			opt.id = this.nextTruequeId()
		}
		
		
		/*DEF: trueque*/
		var trueque = {
			id: opt.id,
			estado: "CERO",
			contacto: opt.contacto,
			ofertas:[
				{
					ofertante: 'USUARIO',
					estado: 'SIN_ENVIAR',
					doy: [],
					recibo: []
				}
			]
		};
		
		this._trueques.push(trueque);
		
		
		
		
		this.onNovedades();
		
		
		return trueque;
		
	},
	
	agregarProductoTrueque: function(trueque, producto, recibo_doy){
		var _this = this;
		
		
		
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		
		if(oferta.ofertante == 'USUARIO'){
			oferta[recibo_doy].push(producto.id);
		}else{
			
			var nuevaOferta = $.extend(true, {}, oferta);
			
			nuevaOferta.ofertante = 'USUARIO';
			nuevaOferta.estado = 'SIN_ENVIAR';
			
			nuevaOferta[recibo_doy].push(producto.id);
			trueque.ofertas.push(nuevaOferta);
		}
		
		
		this.onNovedades();
    },
	
	
    quitarProductoTrueque: function(trueque, producto, recibo_doy){
		var _this = this;
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		
		if(oferta.ofertante == 'USUARIO'){
			
			
			oferta[recibo_doy] = $.grep(oferta[recibo_doy], function(producto_id){
				return producto_id != producto.id;
			});
			
		}else{
			
			var nuevaOferta = $.extend(true, {}, oferta);
			
			nuevaOferta.ofertante = 'USUARIO';
			nuevaOferta.estado = 'SIN_ENVIAR';

			nuevaOferta[recibo_doy] = $.grep(nuevaOferta[recibo_doy], function(producto_id){
				return producto_id != producto.id;
			});
			
				
			trueque.ofertas.push(nuevaOferta);
		}
		
		
		this.onNovedades();
		
    },
	
	
	
	enviarOferta: function(trueque){
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		trueque.estado = 'ABIERTO';
		
		if(oferta.estado == 'ENVIADA'){
			alert('Ya hiciste tu oferta, espera la respuesta.');
			return;
		}
		
		oferta.estado = 'ENVIADA';
		
		
		
        vx.send({
            tipoDeMensaje:"traders.trueque.oferta",
            para: trueque.contacto.id,
            de: this.usuario.id,
            datoSeguro:{
				trueque: {id : trueque.id},
				oferta: oferta
            }
        });
		
		
        this.onNovedades();
    },
	
    
	aceptarTrueque: function(trueque){
		var Traders = this;
		
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		if(oferta.ofertante == 'USUARIO'){
			alert('No podes aceptar tu propia oferta');
			return;
		}
		
		trueque.ofertaDetallada = $.extend(true, {}, oferta);
		
		
		_.each(trueque.ofertaDetallada.doy, function(id_producto, index){
			trueque.ofertaDetallada.doy[index] = _.findWhere(Traders.usuario.inventario, {id: id_producto});
		});
		
		_.each(trueque.ofertaDetallada.recibo, function(id_producto, index){
			trueque.ofertaDetallada.recibo[index] = _.findWhere(trueque.contacto.inventario, {id: id_producto});
		});
       
		
		
		vx.send({
            tipoDeMensaje:"traders.aceptacionDeTrueque",
            para: trueque.contacto.id,
            de: Traders.usuario.id,
            datoSeguro:{
				trueque: {id : trueque.id},
				ofertaDetallada: trueque.ofertaDetallada
            }
        });
		
		trueque.estado = "CERRADO";
		 
		 
		 
		//Traders._concretarTrueque(trueque);
		
        Traders.onNovedades();
    },
    _concretarTrueque: function(trueque){
        var Traders = this;
		
		
		_.each(trueque.ofertaDetallada.doy, function(producto){
		    Traders.quitarProducto(producto);
        });
		
        _.each(trueque.ofertaDetallada.recibo, function(producto){
			Traders.agregarProducto(producto);
        });
		
		
		
		// informo a la comunidad mi inventario actualizado
		/*
		vx.send({
			tipoDeMensaje: "traders.inventario",
			de: Traders.usuario.id,
			datoSeguro:{
				inventario:Traders.usuario.inventario
			}
		});
		*/
    },	
	
	quitarTrueque: function(id){
		this._trueques = $.grep(this._trueques, function(item){
            return item.id != id;
        });
		
		this.onNovedades();
	},

	cambiarAvatar: function(imagen_codificada){
        Usuario.cambiarAvatar();
    }
};