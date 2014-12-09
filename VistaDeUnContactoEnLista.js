var VistaDeUnContactoEnLista = function(idContacto){
    var _this = this;	
	this.idContacto = idContacto;
	
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
	
	var busq_datos_contacto = BS.buscar({id: "DATOS_PERSONALES", idOwner: idContacto});
	busq_datos_contacto.alAgregar(function(datos_contacto){
		lbl_nombre.text(datos_contacto.nombre);
		avatar.attr("src", datos_contacto.avatar);
        
        datos_contacto.alCambiar(function(cambios){
            if(cambios.nombre) lbl_nombre.text(cambios.nombre);
            if(cambios.avatar) avatar.attr("src", cambios.avatar);
        });
	});	
	
	var busq_contacto = BS.buscar({tipo: "Contacto", idOwner: BS.idUsuario, idContacto: idContacto});
	busq_contacto.alAgregar(function(contacto){
		if(contacto.online){
			_this.ui.addClass("contacto_online");
			_this.ui.removeClass("contacto_offline");
		}else{
			_this.ui.removeClass("contacto_online");
			_this.ui.addClass("contacto_offline");
		};
		contacto.alCambiar(function(){
			if(contacto.online){
				_this.ui.addClass("contacto_online");
				_this.ui.removeClass("contacto_offline");
			}else{
				_this.ui.removeClass("contacto_online");
				_this.ui.addClass("contacto_offline");
			};
		});
		contacto.alQuitarDeLaBusqueda(function(){
			_this.ui.remove();
		});
		btn_eliminar.click(function(e){
			contacto.eliminar();
		});	
	});	
};

VistaDeUnContactoEnLista.prototype.desSeleccionar = function(){
   	this.ui.removeClass("contacto_seleccionado");
};

VistaDeUnContactoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};