var VistaDeUnContactoEnLista = function(idContacto){
    var _this = this;	
	Evento.agregarEventoA(this, "alSeleccionar");
	
    this.ui = $("#plantillas .contacto_en_lista").clone();
	var lbl_nombre = this.ui.find("#nombre");
	var avatar = this.ui.find("#avatar");
	var btn_eliminar = this.ui.find("#btn_eliminar");
	
	this.ui.click(function(){
		_this.ui.addClass("contacto_seleccionado");
		_this.seleccionado = true;
		_this.alSeleccionar(idContacto);
	});
	
	var datos_contacto = vx.get({id: "DATOS_PERSONALES", idOwner: idContacto}, {cargarAlInicio: true});
	datos_contacto.alCargar(function(){
		lbl_nombre.text(datos_contacto.nombre);
		avatar.attr("src", datos_contacto.avatar);
	});	
	var hnd_cambio_dp = datos_contacto.alCambiar(function(cambios){
		if(cambios.nombre) lbl_nombre.text(cambios.nombre);
		if(cambios.avatar) avatar.attr("src", cambios.avatar);
	});
	
	var solicitud = vx.get({tipo: "SolicitudDeAmistad", idOwner: Usuario.id, idContacto: idContacto});
	solicitud.alCargar(function(){
		solicitud = solicitud.objetos[0];
		var handler_eliminacion_sol = solicitud.alEliminar(function(){
			hnd_cambio_dp.quitar();
			handler_eliminacion_sol.quitar();
			_this.ui.remove();
		});
		btn_eliminar.click(function(e){
			solicitud.eliminar();
		});	
	});	
};

VistaDeUnContactoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};