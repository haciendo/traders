var VistaDeUnContactoEnLista = function(opt){
    _.extend(this, opt);
    this.start();
};

VistaDeUnContactoEnLista.prototype.start = function(){
    var _this = this;
	
	Evento.agregarEventoA(this, "alSeleccionar");
	
    this.ui = $("#plantillas .contacto_en_lista").clone();
	var lbl_nombre = this.ui.find("#nombre");
	var avatar = this.ui.find("#avatar");
	var btn_eliminar = this.ui.find("#btn_eliminar");
	var btn_aprobar = this.ui.find("#btn_aprobar");
    
	if(this.solicitud.estado == "Recibida") btn_aprobar.show();
	else btn_aprobar.hide();
	btn_aprobar.click(function(){
		_this.solicitud.estado = "Aprobando";
	});
	
	lbl_nombre.text(this.solicitud.estado);
	
	btn_eliminar.click(function(e){
		_this.solicitud.eliminar();
	});		
		
	this.datosContacto = new ObjetoRemotoVortex({id: "DATOS_PERSONALES"}, this.solicitud.idContacto);
	this.datosContacto.load();
	this.datosContacto.alCargar(function(obj){
		avatar.attr("src", obj.avatar);
	});
	
	this.datosContacto.alCambiar(function(cambios){
		if(cambios.avatar) avatar.attr("src", cambios.avatar);
	});
	
	this.ui.click(function(){
		_this.alSeleccionar(_this);
		_this.ui.addClass("contacto_seleccionado");
		_this.seleccionado = true;
		_this.alSeleccionar(_this.datosContacto);
	});
	
    if(this.mostrarBotonQuitar){    
        this.btnQuitar = this.ui.find("#btn_eliminar");
        this.btnQuitar.click(function(){
            _this.alQuitar(_this.solicitud);
        });
        this.btnQuitar.show();
    }
	
	var handler_cambio = this.solicitud.alCambiar(function(cambios){
		if(!cambios.estado) return;
		lbl_nombre.text(_this.solicitud.estado);
		if(_this.solicitud.estado == "Recibida") btn_aprobar.show();
		else btn_aprobar.hide();
	});
	
	var handler_eliminacion = this.solicitud.alEliminar(function(){
		handler_cambio.remove();
		handler_eliminacion.remove();
		_this.ui.remove();
	});
};

VistaDeUnContactoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};