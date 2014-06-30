var Traders = {
	nextId: function(coleccion){		
		var maxValue = -1;
		
		for(var id in coleccion){
			if(parseInt(id)> maxValue){
				maxValue = parseInt(id);
			}
		}
		
		maxValue++;		
		return maxValue.toString();		
	},
	
    usuario: {},
	
    _onUsuarioLogueado:function(){},
	
	_onNovedades:[],
    
	onNovedades: function(){
		var _this = this;
		
		if(arguments.length==1){
			this._onNovedades.push(arguments[0]);
			
		}else{
			//this.saveDataUsuario();
			
			_.each(this._onNovedades, function(evento){
				evento();
			});
		}
		
	},
	
    onUsuarioLogueado:function(callback){
        this._onUsuarioLogueado = callback;
    },

	_contactos:{},
    contactos:function(p){
        if(!p) return this._contactos;
        if(p.id) return this._contactos[p.id];
        if(p.query){
            if(p.query == "") 
                return this._contactos;
            else 
                return _.filter(_.values(this._contactos), function(contacto){
                    return contacto.nombre.indexOf(p.query)>=0 || contacto.id == p.query;
                });  
        }
    },
	
	reset: function(){
		this._contactos = {};
		this._trueques = {};
		this.usuario.inventario = {};
		
		this.saveDataUsuario();
	},
	
	login: function(_nombre, password){
        var _this = this;
		var _id = vx.addKey(_nombre + password);
		
		this.claveRSA = vx.keys[_id];
		
		
        this.usuario = {
            id: _id,
            nombre: _nombre,
            inventario: {},
            avatar:""
        };

		RepositorioDeConexiones.start(this.usuario.id);
		
		////parche para atajar las respuestas
		vx.when({
			para: this.usuario.id
		}, function(mensaje){
			//nada-nop
        });
		
		
		vx.when({
			tipoDeMensaje:"traders.claveAgregada",
			para: this.usuario.id
		},function(mensaje){
			// le completo los datos
			vx.send({
				responseTo: mensaje.idRequest,
				para: mensaje.de,
				de: _this.usuario.id,
				datoSeguro: {
					contacto: {
						nombre: _this.usuario.nombre,
						inventario: _this.usuario.inventario,
						avatar:_this.usuario.avatar
					}
				}
			});
			
			// lo agrego
			_this.agregarContacto(mensaje.datoSeguro.contacto);
			
			
			_this.onNovedades();
			
		});
		
		/* Vemos */
        setTimeout(function(){			
			_this.loadDataUsuario();
        },20);
		
        this._onUsuarioLogueado();
    },
	
	
	
	
    agregarProducto: function(p){
		var producto = _.clone(p);
        
		producto.id = this.nextId(this.usuario.inventario);
		
		this.usuario.inventario[producto.id] = producto;
		
		vx.set(this.usuario.id, "usuario.inventario." + producto.id, producto);
		
        vx.send({
            tipoDeMensaje:"traders.avisoDeNuevoProducto",
            de: this.usuario.id,
            datoSeguro: {
                producto: producto
            }
        });
		
        this.onNovedades();
    },
	modificarProducto: function(p){		
		var producto = this.usuario.inventario[p.id];
		producto = ClonadorDeObjetos.extend(producto, p);
		
        vx.set(this.usuario.id, "usuario.inventario." + producto.id, producto);
		
		vx.send({
            tipoDeMensaje:"traders.avisoDeProductoModificado",
            de: this.usuario.id,
            datoSeguro: {
                producto: producto
            }
        });
		
        this.onNovedades();
    },
    quitarProducto: function(producto){
        delete this.usuario.inventario[producto.id];
		vx.delete(this.usuario.id, "usuario.inventario." + producto.id);	
		vx.send({
            tipoDeMensaje:"traders.avisoDeBajaDeProducto",
            de: this.usuario.id,
            datoSeguro:{
                id_producto: producto.id
            }
        });
		
        this.onNovedades();
    },
	setDataUsuario: function(datos){
		var _this = this;
		
		if(datos) {
			this.usuario = ClonadorDeObjetos.extend(this.usuario, datos.usuario);
		
			this._trueques = datos.trueques;
			
			_.each(_.values(datos.contactos), function(contacto){
				_this.agregarContacto(contacto);
			});
		}
		else{
			this._trueques = {};
		}

		vx.send({
			tipoDeMensaje: "traders.inventario",
			de: _this.usuario.id,
			datoSeguro:{
				inventario:_this.usuario.inventario
			}
		});
		
		this.onNovedades();
	},
	
	
    saveDataUsuario: function(){		
		var _datos = {
			usuario: 					this.usuario,
			contactos:					this.contactos(),
			trueques:					this.trueques()
		};
		
		vx.set(this.usuario.id, "", _datos);		
    },
	
    loadDataUsuario: function(){        
		var _this = this;
		
		vx.get(this.usuario.id, "", function(datos){
			_this.setDataUsuario(datos);
		});	
    },
	
	_trueques:{},
    trueques:function(p){        
		if(!p){
			return this._trueques;
		} else {
			return _.where(_.values(this._trueques), p);
		}
    },
	
	nuevoTrueque: function(opt){
		var _this = this;
		
		
		if(!opt.id){
			opt.id = this.nextId(this._trueques);
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
					doy: {},
					recibo: {}
				}
			]
		};
		
		this._trueques[trueque.id] = trueque;	
		this.onNovedades();		
		return trueque;		
	},
	
	agregarProductoTrueque: function(trueque, producto, recibo_doy){
		var _this = this;
		var oferta = _.last(_.values(trueque.ofertas));

		if(oferta.ofertante == 'USUARIO'){
			oferta[recibo_doy][_this.nextId(oferta[recibo_doy])]=producto.id;
		}else{
			
			var nuevaOferta = $.extend(true, {}, oferta);
			
			nuevaOferta.ofertante = 'USUARIO';
			nuevaOferta.estado = 'SIN_ENVIAR';
			
			nuevaOferta[recibo_doy][_this.nextId(oferta[recibo_doy])]=producto.id;
			trueque.ofertas[_this.nextId(trueque.ofertas)]=nuevaOferta;
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
			trueque.ofertaDetallada.doy[index] = Traders.usuario.inventario[id_producto];
		});
		
		_.each(trueque.ofertaDetallada.recibo, function(id_producto, index){
			trueque.ofertaDetallada.recibo[index] = trueque.contacto.inventario[id_producto];
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
	
	
	agregarContacto: function(){
		//****	arguments[] ****
		// forma 1: idContacto 	string
		// forma 2: contacto 	object
		//**********************
		
		var _this = this;
		
		var contacto = {};
		
		
		
        if(typeof(arguments[0]) == 'string'){
			
			
			var contacto = _this.contactos({id:arguments[0]});
			
			if(!contacto){
			
			
				// es el id
				contacto = {
					id: arguments[0],
					estado: 'SIN_CONFIRMAR',
					nombre: null,
					inventario: {},
					avatar:""
				};
				this._contactos.push(contacto);
			}
			
			vx.send({
				tipoDeMensaje:"traders.claveAgregada",
				de: this.usuario.id,
				para: arguments[0],
				datoSeguro: {
					contacto: {
						id: this.usuario.id,
						nombre: this.usuario.nombre,
						inventario: this.usuario.inventario,
						avatar:this.usuario.avatar
					}
				}
				
			},function(mensaje){
				
				var contacto = _this.contactos({id:mensaje.de});
				
				contacto = ClonadorDeObjetos.extend(contacto, mensaje.datoSeguro.contacto);
				contacto.estado = 'CONFIRMADO';
				
				
				
				_this.onNovedades();
				
				
				
			});
			
		}else if(typeof(arguments[0]) == 'object'){
			
			
			var contacto = _this.contactos({id:arguments[0].id});
			if(!contacto){
			
				contacto=arguments[0];
				this._contactos.push(contacto);
			}
			
		}
		
		
		
		/*
			
		ojo con esta: mensaje de update y hace esto
		
		var contacto = _this.contactos({id:mensaje.de});
		contacto = ClonadorDeObjetos.extend(contacto, mensaje.datoSeguro.contacto);
		
		
		PARA HACER ESTO DEBO PROBAR EL CLONADOR DE OBJETOS CON VECTORES
		
		obj:{
			vec: [],
			atrib: 'bla'
		}
		
		tambien probar el $.extend
		
		*/
		
		
		//publico todos los filtros de ?
		vx.when({
			tipoDeMensaje:"traders.inventario",
			de: contacto.id
		}, function(mensaje){
			
			contacto.inventario = mensaje.datoSeguro.inventario;
			
			_this.onNovedades();
			
        });
		
		
        vx.when({
			tipoDeMensaje:"traders.avisoDeProductoModificado",
			de: contacto.id
		}, function(mensaje){
			var producto = contacto.inventario[mensaje.datoSeguro.producto.id];
			if(producto === undefined) return;			
			producto = ClonadorDeObjetos.extend(producto, mensaje.datoSeguro.producto);
				
			_this.onNovedades();
		});
        
		vx.when({
			tipoDeMensaje:"traders.avisoDeNuevoProducto",
			de: contacto.id
		}, function(mensaje){
			contacto.inventario[mensaje.datoSeguro.producto.id] = mensaje.datoSeguro.producto;
			
			_this.onNovedades();
		});
		
        vx.when({
            tipoDeMensaje:"traders.avisoDeBajaDeProducto",
			de: contacto.id
		}, function(mensaje){			
			delete contacto.inventario[mensaje.datoSeguro.id_producto];			
			_this.onNovedades();
		});
		
		
		vx.when({
			tipoDeMensaje:"traders.trueque.oferta",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			// el contacto debería coincidir, me ahorro recalcularlo, aviso por las dudas
			
			var trueque = _this.trueques({
				id: mensaje.datoSeguro.trueque.id,
				contacto: contacto
			})[0];
			
			
			if(!trueque){
				trueque = _this.nuevoTrueque({
					id: mensaje.datoSeguro.trueque.id,
					contacto: contacto
				});
			}
			
			trueque.estado = 'ABIERTO'
			
			var oferta = mensaje.datoSeguro.oferta;
			
			
			oferta.ofertante = 'CONTACTO';
			oferta.estado = 'RECIBIDA';
			
			
			var aux_doy = oferta.doy;
			oferta.doy = oferta.recibo;
			oferta.recibo = aux_doy;
			
			
			trueque.ofertas.push(oferta);
			
			_this.onNovedades();
		});
		        
		
        vx.when({
            tipoDeMensaje:"traders.aceptacionDeTrueque",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			var trueque = _this.trueques({
				id: mensaje.datoSeguro.trueque.id,
				contacto: contacto
			})[0];
			
			trueque.ofertaDetallada = mensaje.datoSeguro.ofertaDetallada;
			
			var aux_doy = trueque.ofertaDetallada.doy;
			trueque.ofertaDetallada.doy = trueque.ofertaDetallada.recibo;
			trueque.ofertaDetallada.recibo = aux_doy;
			
			
			trueque.estado = "CERRADO";
			
			vx.send({
				tipoDeMensaje:"traders.aceptacionDeTrueque.handShake",
				para: contacto.id,
				de: Traders.usuario.id,
				datoSeguro:{
					trueque: {id : trueque.id}
				}
			});
			
			
			_this._concretarTrueque(trueque);
			
			_this.onNovedades();
		});
		
		
		
		vx.when({
            tipoDeMensaje:"traders.aceptacionDeTrueque.handShake",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			var trueque = _this.trueques({
				id: mensaje.datoSeguro.trueque.id,
				contacto: contacto
			})[0];
			
			_this._concretarTrueque(trueque);
			
			_this.onNovedades();
		});
		
		
		vx.when({
			tipoDeMensaje:"traders.avisoDeCambioDeAvatar",
			de: contacto.id
		}, function(mensaje){
			contacto.avatar = mensaje.datoSeguro.avatar;
			_this.onNovedades();
		});
		
		_this.onNovedades();
		return contacto;
    },
	quitarTrueque: function(id){
		this._trueques = $.grep(this._trueques, function(item){
            return item.id != id;
        });
		
		this.onNovedades();
	},
	quitarContacto: function(id){
		this._contactos = $.grep(this._contactos, function(item){
            return item.id != id;
        });
		
		this.onNovedades();
	},
	cambiarAvatar: function(imagen_codificada){
        this.usuario.avatar=imagen_codificada;
		vx.send({
            tipoDeMensaje:"traders.avisoDeCambioDeAvatar",
            de: this.usuario.id,
            datoSeguro: {
                avatar: imagen_codificada
            }
        });
		
		this.onNovedades();
    }
};