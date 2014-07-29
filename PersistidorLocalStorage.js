var PersistidorLocalStorage = function(opt){
	var _this = this;    
	
	var optDefault = {
		usuario_id: null,
		contacto_id: null
	};
	
	_.extend(this, optDefault, opt);	
	
	if(!this.contacto_id){
		this.contacto_id = this.usuario_id
	}
	
//	this.data_usuario = new VxObject({
//		idObjeto:"dataUsuario", 
//		claveEscritura: this.usuario_id, 
//		claveLectura: this.usuario_id
//	});

	Contactos.change(function(){
		localStorage.setItem(_this.usuario_id + "_Contactos", JSON.stringify(Contactos.resumen()));		
	});
	
	var datos_contactos = localStorage.getItem(_this.usuario_id + "_Contactos");
	if(datos_contactos){
		Contactos.resumen(JSON.parse(datos_contactos));
	}
};
