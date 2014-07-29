var Productos = {
	agregar:function(producto){
		this._productos.push(new Producto(producto));
		
	},
	quitar:function(producto){
		//this._productos.push(new Producto(producto));
	},
	buscar: function(filtro){
		if(!filtro) return this._productos;
        return _.findWhere(this._productos, filtro);
	}
}