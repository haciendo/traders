var Contactos = {
	_contactos:[],
	agregar: function(){
		var _this = this;
		if(typeof(arguments[0]) == 'string'){
		// es el id			
			var contacto = this.buscar({id:arguments[0]});

			if(contacto) return contacto;
			
			contacto = new Contacto({
				id: arguments[0],
				estado: 'SIN_CONFIRMAR',
				nombre: 'Esperando confirmación',
				inventario: [],
				avatar:""
			});
			this._contactos.push(contacto);
			vx.send({
				tipoDeMensaje:"traders.claveAgregada",
				de: Traders.usuario.id,
				para: contacto.id,
				datoSeguro: {
					contacto: {
						id: Traders.usuario.id,
						nombre: Traders.usuario.nombre,
						inventario: Traders.usuario.inventario,
						avatar:Traders.usuario.avatar
					}
				}

			},function(mensaje){
				contacto = _.extend(contacto, mensaje.datoSeguro.contacto);
				contacto.estado = 'CONFIRMADO';			

				Traders.onNovedades();			
			});

		}else if(typeof(arguments[0]) == 'object'){			

			var contacto = this.buscar({id:arguments[0].id});
			if(contacto) return;	

			contacto = new Contacto(arguments[0]);
			this._contactos.push(contacto);		
		}		
		Traders.onNovedades();	
	},
	quitar: function(id){
		this._contactos = $.grep(this._contactos, function(item){
            return item.id != id;
        });
		
		Traders.onNovedades();	
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
	}
}