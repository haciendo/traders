var ListaProductos = function(opt){
    this.alSeleccionar = function(){};
    this.selector = {};
	this.mostrarPropietario = false;
    $.extend(true, this, opt);
    
	var _this = this;
	this.ui = $("#plantillas").find(".lista_productos").clone();  
	this.listado_de_productos = this.ui.find("#listado_de_productos");
	
	this.productos.alCargar(function(){
		_this.productos.forEach(function(producto){
			_this.agregarVistaProducto(producto, _this.productos.idOwner);
		});
	});
	this.productos.alAgregar(function(producto){
		_this.agregarVistaProducto(producto, _this.productos.idOwner);
	});
};

ListaProductos.prototype.agregarVistaProducto = function(un_producto, propietario){
    var _this = this;
    var vista = new VistaDeUnProductoEnLista({
        producto: un_producto,
		propietario: propietario,
		mostrarPropietario: this.mostrarPropietario,
        alClickear: function(producto_clickeado){
            _this.alSeleccionar(producto_clickeado);
        },
        alEliminar: _this.alEliminar
    });
    vista.dibujarEn(_this.listado_de_productos);
};

ListaProductos.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

