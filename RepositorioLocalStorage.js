var RepositorioLocalStorage = {
	start: function(){
		if(!Usuario.id){
			throw "El usuario todavía no se logueo y ya se está inicializando el repo, mal..."; 
		}
		var keys = Object.keys(localStorage);
		this.objetosGuardados = [];
		keys.forEach(function(k){
			if(k.split('_')[0]==Usuario.id) this.objetosGuardados.push(JSON.parse(Encriptador.desEncriptarString(localStorage.getItem(k), Usuario.id, Usuario.id)));
		});
	},
	save: function(objeto){
		if(objeto.id){
			var obj_guardado = _.find(this.objetosGuardados, function(o){
				return o.id = objeto.id;
			});
			_.extend(obj_guardado, objeto);
		}
		else{
			objeto.id = this.nextId();
		}
		localStorage.setItem(Usuario.id+"_"+objeto.id, Encriptador.encriptarString(JSON.stringify(objeto), Usuario.id, Usuario.id));
		
	},
	load: function(filtro){
		return _.where(this.objetosGuardados, filtro);
	},
	nextId: function() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 6; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
};
