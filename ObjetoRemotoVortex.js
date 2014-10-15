var ObjetoRemotoVortex = function(id, id_owner, opt){
	if(opt) if(opt.valorInicial) _.extend(this, opt.valorInicial);
	this.id = id;
	this.idOwner = id_owner;
	
	var _this= this;
	Evento.agregarEventoA(this, "alCargar");
	Evento.agregarEventoA(this, "alEliminar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alNoExistir");
	Evento.agregarEventoA(this, "alDesconectar");
	
	var update_observer = function(changes){
		var cambios = {};
		changes.forEach(function(change) {
			cambios[change.name] = _this[change.name];
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
		_this.alEliminar();
        _this.desconectar();
	});
	
    var pedido_aviso_conexion = vx.when({
		tipoDeMensaje:"vortex.avisoDeRepositorioOnline",
		de: this.idOwner
	}, function(aviso){
		_this.load();
	});
    
	var pedido_no_existencia = this.alNoExistir(function(){
		if(opt.insertarSiNoExiste){
			vx.send({
				tipoDeMensaje: "vortex.persistencia.insert",
				de: Usuario.id,
				para: _this.idOwner,
				datoSeguro:{ objeto: opt.valorInicial}
			}, function(resp){
				if(resp.datoSeguro.resultado == "success"){
					_this.alCambiar(opt.valorInicial);
				}
			});
		}
	});
	
    var pedido_desconexion = this.alDesconectar(function(){
		pedido_modificacion.quitar();
		pedido_eliminacion.quitar();
        pedido_aviso_conexion.quitar();
        pedido_no_existencia.quitar();
        pedido_desconexion.quitar();
        Object.unobserve(_this, update_observer);
	});
    
	if(opt.cargarAlInicio) this.load();
};

ObjetoRemotoVortex.prototype.load = function(){
	var _this = this;
	vx.send({
		tipoDeMensaje: "vortex.persistencia.select",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro: {filtro: {id: this.id}}
	}, function(respuesta){
		if(respuesta.datoSeguro.objetos.length>0) {
			_.extend(_this, respuesta.datoSeguro.objetos[0]);
			_this.alCargar(_this);
		}
		else _this.alNoExistir();
	});
};

ObjetoRemotoVortex.prototype.desconectar = function(){
    this.alDesconectar();
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

