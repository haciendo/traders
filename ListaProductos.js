var ListaProductos = function(opt){
    this.alSeleccionar = function(){};
    this.selector = {};
	this.mostrarPropietario = false;
    $.extend(true, this, opt);
    
	var _this = this;
	this.ui = $("#plantillas").find(".lista_productos").clone();  
	this.listado_de_productos = this.ui.find("#listado_de_productos");
	
	vx.send({
		tipoDeMensaje: "vortex.persistencia.select",
		de: Usuario.id,
		para: this.selector.propietario,
		datoSeguro: {
				filtro: {
					tipo: "Producto"
				}
			}
	}, function(respuesta){
		_.forEach(respuesta.datoSeguro.objeto, function(producto){
			_this.agregarVistaProducto(producto, _this.selector.propietario);
		});
	});
		
	vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeObjetoNuevo",
		de: this.selector.propietario
	}, function(aviso){
		_this.agregarVistaProducto(aviso.datoSeguro.objeto, _this.selector.propietario);
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

