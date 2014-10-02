var VistaDeUnProductoEnLista = function(opt){
	this.alClickear = this.alternarSeleccionParaTrueque;
    $.extend(true, this, opt);
    this.start();
};

VistaDeUnProductoEnLista.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_lista").clone();  
    this.lblNombre = this.ui.find("#nombre");
    this.thumbnail = this.ui.find("#thumbnail_producto");
    this.btnEliminar = this.ui.find("#btn_eliminar");
    this.btnEliminar.hide();
	
	this.avatar_propietario = this.ui.find("#avatar_propietario");
	this.avatar_propietario.click(function(){
		//TO DO: abrir pantalla de usuario o contacto segun corresponda
	});
	
    if(this.alEliminar){        
        this.btnEliminar.click(function(){
            _this.alEliminar(_this.producto);
        });
        this.btnEliminar.show();
    }
    this.ui.click(function(){
		_this.alClickear(_this.producto);
    });
	
	this.lblNombre.text(this.producto.nombre);
	
    if(this.producto.imagen) this.thumbnail.attr("src", this.producto.imagen);
    else this.thumbnail.attr("src", "Gift-icon.png");
	
	if(this.mostrarPropietario){ 
		if(this.propietario.avatar) this.avatar_propietario.attr("src", this.propietario.avatar);
    	else this.avatar_propietario.attr("src", "avatar_default.png");
		this.avatar_propietario.show();
		this.avatar_propietario.opentip( this.propietario.nombre);
	}
	
	var pedido_modificacion = vx.when({
		de: this.propietario,
		tipoDeMensaje:"traders.avisoDeModificacionDeProducto",
		idProducto: this.producto.id		
	}, function(aviso){
		var cambios = aviso.datoSeguro.cambios;
		if(cambios.nombre) _this.lblNombre.text(cambios.nombre);
		if(cambios.imagen) _this.thumbnail.attr("src", cambios.imagen);
		_.extend(_this.producto, cambios); //capaz que es al pedo, lo hice por las dudas, que bien que vendrian unos tests
	});
	
	var pedido_eliminacion = vx.when({
		de: this.propietario,
		tipoDeMensaje:"traders.avisoDeEliminacionDeProducto",
		idProducto: this.producto.id		
	}, function(aviso){
		pedido_modificacion.quitar();
		pedido_eliminacion.quitar();
		_this.ui.remove();
	});
};

VistaDeUnProductoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};