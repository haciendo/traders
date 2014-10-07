var PantallaListaContactos = {
    start: function(){		
        var _this = this;
		
		Evento.agregarEventoA(this, "alSeleccionar");
		
        this.ui =  $("#pantalla_lista_contactos");     
        this.solicitudesDeAmistad = new ColeccionRemotaVortex({tipo: "SolicitudDeAmistad"}, Usuario.id);
		
        this.contacto_seleccionado = {};        
		
        this.lista_contactos = this.ui.find("#lista_contactos");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			vex.dialog.prompt({
				message: 'Ingrese el id del usuario',
				placeholder: 'Id del usuario',
				callback: function(value) {
					if(value){
						_this.solicitudesDeAmistad.crear({
							idContacto: value,
							estado: "Enviando"
						});
					}
				}
			});			
		});
        
		this.solicitudesDeAmistad.alAgregar(function(solicitud){
			_this.agregarVistaContacto(solicitud);
		});
    },
	
	agregarVistaContacto: function(solicitud){
		var _this = this;
		var vista = new VistaDeUnContactoEnLista({solicitud: solicitud});
		vista.alSeleccionar(function(datos_contacto){
			_this.alSeleccionar(datos_contacto);
		});
		vista.dibujarEn(this.lista_contactos);
	}
};