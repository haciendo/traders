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
	
	var busq_datos_contacto = BC.buscar({id: "DATOS_PERSONALES", idOwner: idContacto});
	busq_datos_contacto.alCargar(function(){
        var datos_contacto = busq_datos_contacto.resultados[0];
		lbl_nombre.text(datos_contacto.nombre);
		avatar.attr("src", datos_contacto.avatar);
        
        datos_contacto.alCambiar(function(cambios){
            if(cambios.nombre) lbl_nombre.text(cambios.nombre);
            if(cambios.avatar) avatar.attr("src", cambios.avatar);
        });
	});	
	
	var busq_solicitud = BC.buscar({tipo: "SolicitudDeAmistad", idOwner: BC.idUsuario, idContacto: idContacto});
	busq_solicitud.alCargar(function(){
		solicitud = busq_solicitud.resultados[0];
		solicitud.alQuitarDeLaBusqueda(function(){
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