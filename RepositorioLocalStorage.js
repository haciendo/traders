var RepositorioLocalStorage = {
	start: function(opt){
		var _this = this;  
		var optDefault = {
			usuario_id: null
		};
		_.extend(this, optDefault, opt);			
	},
	save: function(objeto){
		objeto.id = objeto.id||this.nextId();
		if(!objeto.tipo) throw "el objeto debe tener un tipo para ser guardado"
		localStorage.setItem(Usuario.id+"_"+objeto.tipo+"_"+objeto.id, Encriptador.EncriptarString(JSON.stringify(objeto))));
	},
	get: function(filtro){
		if(filtro.id) return JSON.parse(localStorage.getItem(Usuario.id+"_"+filtro.tipo+"_"+filtro.id));
		
	},
	nextId: function() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 6; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
};
