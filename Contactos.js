var Contactos = {
	_contactos:[],
	start: function(opt){
		var _this = this;
		_.extend(this, opt);
		var str_datos_guardados = Persistidor.get(Usuario.id + "_Contactos");
		if(str_datos_guardados){
			var ids_contactos_guardados = JSON.parse(str_datos_guardados);
			_.each(ids_contactos_guardados, function(un_id_contacto){
				_this.agregar(new Contacto({
					id: un_id_contacto,
					idUsuario: Usuario.id
				}));				
			});
		}
		
		this.change(function(){
			Persistidor.set(Usuario.id + "_Contactos", _this.resumenParaGuardar());
		});
		this.change();
	},
    solicitarAmistad: function(id_contacto){
        var contacto = this.buscar({id:id_contacto});
        if(contacto) {
            vex.dialog.alert("Ya sos amigo de este usuario, se llama :" +contacto.nombre);
            return;
        }
        var contacto = this.agregar({
            id: id_contacto,
            estado: 'SIN_CONFIRMAR',
            nombre: '¿¿¿???',
            inventario: [],
            avatar:""
        });       
        vx.send({
            tipoDeMensaje:"traders.solicitudDeAmistad",
            de: Usuario.id,
            para: id_contacto,
            datoSeguro: {
				contacto: Usuario.resumenParaEnviar()
            }

        },function(mensaje){
            if(mensaje.datoSeguro.solicitudAceptada) contacto.confirmar(mensaje.datoSeguro.contacto); 
        });
    },
	agregar: function(datos_contacto){
		var _this = this;
		var contacto = this.buscar({id:datos_contacto.id});
        if(contacto) return;	
        
        contacto = new Contacto(datos_contacto);
        contacto.alEliminar(function(){
            _this.quitar(contacto.id);
        });
        this._contactos.push(contacto);		
		
		this.onAdd(contacto);
		this.change();
        return contacto;
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