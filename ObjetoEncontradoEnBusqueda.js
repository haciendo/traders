var ObjetoEncontradoEnBusqueda = function(valor_inicial){
    var _this = this;
	Evento.agregarEventoA(this, "alEliminar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alQuitarDeLaBusqueda");
    _.extend(this, valor_inicial);
    Object.observe(this, function(changes){
        _this.alEliminar
		_this._vx_update_observer(changes);
	});
    this.alQuitarDeLaBusqueda(function(){
        Object.unobserve(_this, _this._vx_update_observer);
        Evento.limpiarHandlersDeEventosDe(_this);
    });
};

ObjetoEncontradoEnBusqueda.prototype._vx_update_observer = function(changes){
    var _this = this;
    var cambios = {};
    changes.forEach(function(change) {
        cambios[change.name] = _this[change.name];
    });
    
    vx.send({
        tipoDeMensaje: "vortex.persistencia.update",
        de: BC.idUsuario,
        para: this.idOwner,
        datoSeguro: {
            filtro: {id: this.id},
            cambios: cambios
        }
    }, function(resp){
        
    });
};

ObjetoEncontradoEnBusqueda.prototype.modificarSinAvisarPorVx = function(cambios){
    Object.unobserve(this, this._vx_update_observer);
    _.extend(this, cambios);
    Object.observe(this, this._vx_update_observer);
    this.alCambiar(cambios);
};

ObjetoEncontradoEnBusqueda.prototype.quitarDeLaBusqueda = function(){
    this.alQuitarDeLaBusqueda();
};

ObjetoEncontradoEnBusqueda.prototype.eliminar = function(){
    var _this = this;
	vx.send({
		tipoDeMensaje: "vortex.persistencia.delete",
		de: BC.idUsuario,
		para: this.idOwner,
		datoSeguro:{ filtro:{ id: this.id}}
	}, function(msg){
		_this.alEliminar();
	});
};
