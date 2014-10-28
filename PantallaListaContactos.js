var PantallaListaContactos = {
    start: function(){		
        var _this = this;
		
		Evento.agregarEventoA(this, "alSeleccionar");
		
        this.ui =  $("#pantalla_lista_contactos");     
        this.solicitudesDeAmistad = BC.buscar({tipo: "SolicitudDeAmistad", idOwner: Usuario.id});
		this.vistas = [];
		
        this.lista_contactos = this.ui.find("#lista_contactos");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			vex.dialog.prompt({
				message: 'Ingrese el id del usuario',
				placeholder: 'Id del usuario',
				callback: function(value) {
					if(value){
                        if(_this.solicitudesDeAmistad.findWhere({idContacto: value})){
                            alertify.error("Solicitud ya enviada");
                            return;
                        }
                        _this.solicitudesDeAmistad.insertar({
							idContacto: value,
							estado: "Enviando"
						});
					}
				}
			});			
		});
        
		this.solicitudesDeAmistad.alAgregar(function(solicitud){
			_this.agregarVistaContacto(solicitud.idContacto);
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