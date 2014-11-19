var PantallaListaContactos = {
    start: function(){		
        var _this = this;
		
		Evento.agregarEventoA(this, "alSeleccionar");
		
        this.ui =  $("#pantalla_lista_contactos");     
        this.contactos = BS.buscar({tipo: "Contacto", idOwner: Usuario.id});
		this.vistas = [];
		
        this.lista_contactos = this.ui.find("#lista_contactos");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			vex.dialog.prompt({
				message: 'Ingrese el id del usuario',
				placeholder: 'Id del usuario',
				callback: function(value) {
					if(value){
                        if(_this.contactos.findWhere({idContacto: value})){
                            alertify.error("Solicitud ya enviada");
                            return;
                        }
                        _this.contactos.insertar({
							idContacto: value,
							estadoSolicitud: "Enviando"
						});
					}
				}
			});			
		});
        
		this.contactos.alAgregar(function(contacto){
			_this.agregarVistaContacto(contacto.idContacto);
		});
    },
	
	agregarVistaContacto: function(idContacto){
		var _this = this;
        
		var vista = new VistaDeUnContactoEnLista(idContacto);
		vista.alSeleccionar(function(){
			_.forEach(_this.vistas, function(v){
				if(v.idContacto != idContacto) v.desSeleccionar();
			});
			_this.alSeleccionar(idContacto);
		});
		this.vistas.push(vista);
		vista.dibujarEn(this.lista_contactos);
	}
};