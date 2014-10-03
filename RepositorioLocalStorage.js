var RepositorioLocalStorage = {
	start: function(){
		if(!Usuario.id){
			throw "El usuario todavía no se logueo y ya se está inicializando el repo, mal..."; 
		}
		var keys = Object.keys(localStorage);
		this.objetosGuardados = [];
		var _this = this;
		_.forEach(keys, function(k){
			if(k.split('_')[0]==Usuario.id) _this.objetosGuardados.push(JSON.parse(Encriptador.desEncriptarString(localStorage.getItem(k), Usuario.id, Usuario.id)));
		});
        this.callbacks_insercion = [];
        this.callbacks_actualizacion = [];
        this.callbacks_eliminacion = [];
	},
	insert: function(objeto){
		if(objeto.id){
            this.update({id:objeto.id}, objeto);
            return;
		}
        objeto.id = this.nextId();
        this.objetosGuardados.push(objeto);
		localStorage.setItem(Usuario.id+"_"+objeto.id, Encriptador.encriptarString(JSON.stringify(objeto), Usuario.id, Usuario.id));
		this.onObjetoInsertado(objeto);
	},
	select: function(filtro){
		return _.where(this.objetosGuardados, filtro);
	},
	update: function(filtro, cambios){
		var _this = this;
		var objetos_filtrados = this.select(filtro);
		_.forEach(objetos_filtrados, function(objeto){
			_.extend(objeto, cambios);		            
			localStorage.setItem(Usuario.id+"_"+objeto.id, Encriptador.encriptarString(JSON.stringify(objeto), Usuario.id, Usuario.id));		
            _this.onObjetoActualizado(objeto);
		});
		return objetos_filtrados;
	},
	remove: function(filtro){
        var _this = this;
		var objetos_filtrados = this.select(filtro);
        this.objetosGuardados = _.without(this.objetosGuardados, _.findWhere(this.objetosGuardados, filtro));
		_.forEach(objetos_filtrados, function(objeto){
			localStorage.removeItem(Usuario.id+"_"+objeto.id);	            
            _this.onObjetoEliminado(objeto);
		});
		return objetos_filtrados;
	},
    onObjetoInsertado: function(arg){
        if(arg){
            if(_.isFunction(arg)) this.callbacks_insercion.push(arg);
            else _.forEach(this.callbacks_insercion, function(cbk){ cbk(arg);})
        }else{
            _.forEach(this.callbacks_insercion, function(cbk){ cbk();})
        }        
    },
    onObjetoActualizado: function(arg){
        if(arg){
            if(_.isFunction(arg)) this.callbacks_actualizacion.push(arg);
            else _.forEach(this.callbacks_actualizacion, function(cbk){ cbk(arg);})
        }else{
            _.forEach(this.callbacks_actualizacion, function(cbk){ cbk();})
        }        
    },
    onObjetoEliminado: function(arg){
        if(arg){
            if(_.isFunction(arg)) this.callbacks_eliminacion.push(arg);
            else _.forEach(this.callbacks_eliminacion, function(cbk){ cbk(arg);})
        }else{
            _.forEach(this.callbacks_eliminacion, function(cbk){ cbk();})
        }        
    },
	nextId: function() {
		var id = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 6; i++ )
			id += possible.charAt(Math.floor(Math.random() * possible.length));

		if(_.findWhere(this.objetosGuardados, {id:id})) return this.nextId();
		return id;
	}
};
