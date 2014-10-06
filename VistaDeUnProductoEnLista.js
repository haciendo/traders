var VistaDeUnProductoEnLista = function(opt){
    $.extend(true, this, opt);
    this.start();
};

VistaDeUnProductoEnLista.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_lista").clone();  
    
    Evento.agregarEventoA(this, "alClickear");
    Evento.agregarEventoA(this, "alQuitar");
	
    if(this.mostrarBotonQuitar){    
        this.btnQuitar = this.ui.find("#btn_eliminar");
        this.btnQuitar.click(function(){
            _this.alQuitar(_this.producto);
        });
        this.btnQuitar.show();
    }
    this.ui.click(function(){
		_this.alClickear(_this.producto);
    });
	
    this.lblNombre = this.ui.find("#nombre");
	this.lblNombre.text(this.producto.nombre);
    
    this.thumbnail = this.ui.find("#thumbnail_producto");	
    if(this.producto.imagen) this.thumbnail.attr("src", this.producto.imagen);
    else this.thumbnail.attr("src", "Gift-icon.png");
	
	if(this.mostrarPropietario){ 
        this.avatar_propietario = this.ui.find("#avatar_propietario");
        this.avatar_propietario.click(function(){
            //TO DO: abrir pantalla de usuario o contacto segun corresponda
        });
		if(this.propietario.avatar) this.avatar_propietario.attr("src", this.propietario.avatar);
    	else this.avatar_propietario.attr("src", "avatar_default.png");
		this.avatar_propietario.show();
		this.avatar_propietario.opentip( this.propietario.nombre);
	}
	
	var handler_cambio = this.producto.alCambiar(function(cambios){
		if(cambios.nombre) _this.lblNombre.text(cambios.nombre);
		if(cambios.imagen) _this.thumbnail.attr("src", cambios.imagen);
	});
	
	var handler_eliminacion = this.producto.alEliminar(function(){
		handler_cambio.remove();
		handler_eliminacion.remove();
		_this.ui.remove();
	});
};

VistaDeUnProductoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};