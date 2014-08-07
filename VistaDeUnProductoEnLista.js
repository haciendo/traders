var VistaDeUnProductoEnLista = function(opt){
    _.extend(this, opt);
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
	
	var change_handler = this.producto.change(function(){
		_this.render();
	});
	
	var eliminar_handler = this.producto.alEliminar(function(){
		_this.ui.remove();
		change_handler.remove();
		eliminar_handler.remove();
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
	this.render();
};

VistaDeUnProductoEnLista.prototype.render = function(){
	this.lblNombre.text(this.producto.nombre);
    if(this.producto.imagen) this.thumbnail.attr("src", this.producto.imagen);
    else this.thumbnail.attr("src", "Gift-icon.png");
	if(this.mostrarPropietario){ 
		if(this.propietario.avatar) this.avatar_propietario.attr("src", this.propietario.avatar);
    	else this.avatar_propietario.attr("src", "avatar_default.png");
		this.avatar_propietario.show();
		this.avatar_propietario.opentip( this.propietario.nombre);
	}
};

VistaDeUnProductoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};