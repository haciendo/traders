var ColeccionRemotaVortex = function(filtro, id_owner){
	var _this = this;
	this.objetos = [];
	this.filtro = filtro;
	this.idOwner = id_owner;
	
	Evento.agregarEventoA(this, "alCargar", true);
	Evento.agregarEventoA(this, "alAgregar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alQuitar");
	
	vx.send({
		tipoDeMensaje: "vortex.persistencia.select",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro: {filtro: filtro}
	}, function(respuesta){
		_.forEach(respuesta.datoSeguro.objetos, function(objeto){
			_this._agregar(objeto);
		});
		_this.alCargar(_this.objetos);
	});
	
	vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeObjetoNuevo",
		de: this.idOwner,
		tipoDeObjeto: filtro.tipo
	}, function(aviso){
		_this._agregar(aviso.datoSeguro.objeto);
	});
};

ColeccionRemotaVortex.prototype.crear = function(valor_inicial){
	vx.send({
		tipoDeMensaje: "vortex.persistencia.insert",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro:{ objeto: _.extend(this.filtro, valor_inicial)}
	});
};

ColeccionRemotaVortex.prototype.forEach = function(iterador){
	_.forEach(this.objetos, function(objeto){
		iterador(objeto);
	})
};

ColeccionRemotaVortex.prototype._elObjetoPasaElFiltro = function(obj){
	return _.findWhere([obj], this.filtro) !== undefined;
};

ColeccionRemotaVortex.prototype._agregar = function(obj){
	var _this = this;
	if(_.findWhere(_this.objetos, {id: obj.id})) return;
	var vxo = new ObjetoRemotoVortex(obj, this.idOwner);
	var modificar_hnd = vxo.alCambiar(function(cambios){
		if(_this._elObjetoPasaElFiltro(vxo)) {
			_this.alCambiar(vxo, cambios);	
			return;
		}
		_this._quitar(vxo);
		eliminar_hnd.remove();
		modificar_hnd.remove();
	});
	var eliminar_hnd = vxo.alEliminar(function(){
		_this._quitar(vxo);
		eliminar_hnd.remove();
		modificar_hnd.remove();
	});
	this.objetos.push(vxo);
	this.alAgregar(vxo);
};

ColeccionRemotaVortex.prototype._quitar = function(obj){
	var vxo = _.findWhere(this.objetos, {id: obj.id});
	if(!vxo) return;
	this.objetos = _.without(this.objetos, vxo);
	this.alQuitar(vxo);
};