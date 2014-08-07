var Persistidor = {
	set: function(clave, valor){
		localStorage.setItem(clave, JSON.stringify(valor));
	},
	get: function(clave){
		return localStorage.getItem(clave);
	},
	remove: function(clave){
		localStorage.removeItem(clave);
	}
};