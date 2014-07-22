var PersistidorLocalStorage = function(opt){
	var _this = this;    
	
	var optDefault = {
		usuario_id: null,
		contacto_id: null
	};
	
	$.extend(true, optDefault, opt);	
	$.extend(true, this, optDefault);	
	
	if(!this.contacto_id){
		this.contacto_id = this.usuario_id
	}
	
	this.data_usuario = new VxObject({
		idObjeto:"dataUsuario", 
		claveEscritura: this.usuario_id, 
		claveLectura: this.usuario_id
	});

	this.data_usuario.change(function(){
		localStorage.setItem(_this.usuario_id, _this.data_usuario.valorEncriptado());
	});
	var datos = localStorage.getItem(_this.usuario_id);
	if(datos){
		this.data_usuario.valorEncriptado(datos);
	}
};
