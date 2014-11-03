var VistaDeUnProductoEnLista = function(opt){
    _.extend(this, opt);
    this.start();
};

VistaDeUnProductoEnLista.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_lista").clone();  
    
    Evento.agregarEventoA(this, "alClickear");
    Evento.agregarEventoA(this, "alClickearBotonEliminar");
	
    if(this.mostrarBotonQuitar){    
        this.btnQuitar = this.ui.find("#btn_eliminar");
        this.btnQuitar.click(function(event){
			event.stopPropagation();
            _this.alClickearBotonEliminar(_this.producto);
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
		
		var busq_datos_contacto = BS.buscar({id: "DATOS_PERSONALES", idOwner: this.producto.idOwner});
		busq_datos_contacto.alAgregar(function(datos_contacto){
			_this.avatar_propietario.opentip(datos_contacto.nombre);
			_this.avatar_propietario.attr("src", datos_contacto.avatar);
			
			datos_contacto.alCambiar(function(cambios){
				if(cambios.nombre) _this.avatar_propietario.opentip(datos_contacto.nombre);
				if(cambios.avatar) _this.avatar_propietario.attr("src", datos_contacto.avatar);
			});
			_this.avatar_propietario.show();
		});	        
	}
	
	this.producto.alCambiar(function(cambios){
		if(cambios.nombre) _this.lblNombre.text(cambios.nombre);
		if(cambios.imagen) _this.thumbnail.attr("src", cambios.imagen);
	});
	
	this.producto.alQuitarDeLaBusqueda(function(){
		_this.ui.remove();
	});
};

VistaDeUnProductoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};