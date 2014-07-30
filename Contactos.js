var Contactos = {
	_contactos:[],
	start: function(opt){
		var _this = this;
		_.extend(this, opt);
		var str_datos_guardados = localStorage.getItem(this.idUsuario + "_Contactos");
		if(str_datos_guardados){
			var ids_contactos_guardados = JSON.parse(str_datos_guardados);
			_.each(ids_contactos_guardados, function(un_id_contacto){
				_this.agregar(new Contacto({
					id: un_id_contacto,
					idUsuario: _this.idUsuario
				}));				
			});
		}
		
		this.change(function(){
			localStorage.setItem(_this.idUsuario + "_Contactos", JSON.stringify(_this.resumenParaGuardar()));
		});
		this.change();
	},
	agregar: function(){
		var _this = this;
		var contacto;
		if(_.isString(arguments[0])){
		// es el id			
			contacto = this.buscar({id:arguments[0]});

			if(contacto) return contacto;
			
			contacto = new Contacto({
				id: arguments[0],
				idUsuario: this.idUsuario,
				estado: 'SIN_CONFIRMAR',
				nombre: '¿¿¿???',
				inventario: [],
				avatar:""
			});
			
			contacto.alEliminar(function(){
				_this.quitar(contacto.id);
			});
			this._contactos.push(contacto);
			vx.send({
				tipoDeMensaje:"traders.claveAgregada",
				de: this.idUsuario,
				para: contacto.id,
				datoSeguro: {
					contacto: {
						id: this.idUsuario,
						nombre: Traders.usuario.nombre,
						inventario: Traders.usuario.inventario,
						avatar:Traders.usuario.avatar
					}
				}

			},function(mensaje){
				contacto = _.extend(contacto, mensaje.datoSeguro.contacto);
				contacto.estado = 'CONFIRMADO';		
				contacto.change();
				//Traders.onNovedades();			
			});
			
		}else if(_.isObject(arguments[0])){	
			contacto = this.buscar({id:arguments[0].id});
			if(contacto) return;	

			contacto = new Contacto(arguments[0]);
			contacto.alEliminar(function(){
				_this.quitar(contacto.id);
			});
			this._contactos.push(contacto);		
		}		
		contacto.alEliminar(function(){
			_this.change();
		});
		
		this.onAdd(contacto);
		this.change();
	},
	quitar: function(id){
		this._contactos = $.grep(this._contactos, function(item){
            return item.id != id;
        });
		
		this.onRemove(id);
		this.change();
	},
	buscar: function(p){
		if(!p) return this._contactos;
        if(p.id) return _.findWhere(this._contactos, {id:p.id});
        if(p.query){
            if(p.query == "") 
                return this._contactos;
            else 
                return _.filter(this._contactos, function(contacto){
                    return contacto.nombre.indexOf(p.query)>=0 || contacto.id == p.query;
                });  
        }
	},
	onAdd: function(){
		var _this = this;
		if(!this._onAdd) this._onAdd = new Evento();
		if(_.isFunction(arguments[0])){		
			return this._onAdd.addHandler(arguments[0]);			
		}else{
			this._onAdd.disparar(arguments[0]);
		}		
	},
	onRemove: function(){
		var _this = this;
		if(!this._onRemove) this._onRemove = new Evento();
		if(_.isFunction(arguments[0])){		
			return this._onRemove.addHandler(arguments[0]);			
		}else{
			this._onRemove.disparar(arguments[0]);
		}		
	},
	change: function(){
		var _this = this;
		if(!this._change) this._change = new Evento();
		if(_.isFunction(arguments[0])){		
			return this._change.addHandler(arguments[0]);			
		}else{
			this._change.disparar();
		}		
	},
	resumenParaGuardar: function(resumen){
		resumen = [];
		_.each(this._contactos, function(contacto){
			resumen.push(contacto.id);
		});
		return resumen;
	}
}