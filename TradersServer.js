var TradersServer = function(opt){
	var _this = this;
	_.extend(this, opt);
	
	// pedidos
	vx.when({
		de: this.usuario.id,
		para: this.usuario.id,
		tipoDeMensaje: "traders.crearProducto"
	}, function(msg){
		var producto = _.clone(msg.producto);
		_this.persistidor.save(producto);
		
        vx.send({
            tipoDeMensaje:"traders.avisoDeNuevoProducto",
            de: this.usuario.id,
            datoSeguro: {
                producto: producto
            }
        });
	});
};