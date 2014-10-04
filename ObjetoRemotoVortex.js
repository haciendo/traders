var ObjetoRemotoVortex = function(objeto, id_owner){
	_.extend(this, objeto);
	this.idOwner = id_owner;
	
	var _this= this;
	Evento.agregarEventoA(this, "alEliminar");
	Evento.agregarEventoA(this, "alCambiar");
	
	var update_observer = function(changes){
		var cambios = {};
		changes.forEach(function(change) {
			cambios[change.name] = _this[changes.name];
		});
		
		vx.send({
			tipoDeMensaje: "vortex.persistencia.update",
			de: Usuario.id,
			para: id_owner,
			datoSeguro: {
				filtro:{id: _this.id},
				cambios: cambios
			}
		}, function(resp){
			
		});
	};
	
	var pedido_modificacion = vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeObjetoActualizado",
		de: id_owner,
		idObjeto: this.id		
	}, function(aviso){
		Object.unobserve(_this, update_observer);
		_.extend(_this, aviso.datoSeguro.cambios);
		Object.observe(_this, update_observer);
		_this.alCambiar(aviso.datoSeguro.cambios);
	});
	
	Object.observe(this, function(changes){
		update_observer(changes);
	});
	
	var pedido_eliminacion = vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeObjetoEliminado",
		de: id_owner,
		idObjeto: this.id		
	}, function(aviso){
		pedido_modificacion.quitar();
		pedido_eliminacion.quitar();
		_this.alEliminar();
	});
};

ObjetoRemotoVortex.prototype.eliminar = function(){
	vx.send({
		tipoDeMensaje: "vortex.persistencia.delete",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro:{ filtro:{ id: this.id}}
	}, function(msg){
		//se elimino correctamente
	});
};

