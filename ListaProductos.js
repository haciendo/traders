var ListaProductos = function(opt){
	this.mostrarPropietario = false;
    $.extend(true, this, opt);
    
	var _this = this;
	this.ui = $("#plantillas").find(".lista_productos").clone();  
	this.listado_de_productos = this.ui.find("#listado_de_productos");
	
    Evento.agregarEventoA(this, "alSeleccionarProducto");
    Evento.agregarEventoA(this, "alQuitarProducto");
    
	this.productos.alAgregar(function(producto){
		_this.agregarVistaProducto(producto);
	});
};

ListaProductos.prototype.agregarVistaProducto = function(un_producto){
    var _this = this;
    var vista = new VistaDeUnProductoEnLista({
        producto: un_producto,
		mostrarPropietario: this.mostrarPropietario,
		mostrarBotonQuitar: this.mostrarBotonQuitar
    });
    vista.alClickear(function(){
        _this.alSeleccionarProducto(un_producto);
    });
    vista.alQuitar(function(){
        _this.alQuitarProducto(un_producto);
    });
    vista.dibujarEn(_this.listado_de_productos);
};

ListaProductos.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

