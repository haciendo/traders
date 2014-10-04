var ColeccionRemotaVortex = function(tipo, id_owner){
	var _this = this;
	this.objetos = [];
	this.tipo = tipo;
	this.idOwner = id_owner;
	
	Evento.agregarEventoA(this, "alCargar", true);
	Evento.agregarEventoA(this, "alAgregar");
	
	vx.send({
		tipoDeMensaje: "vortex.persistencia.select",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro: {filtro: {tipo: tipo}}
	}, function(respuesta){
		_.forEach(respuesta.datoSeguro.objetos, function(objeto){
			_this.objetos.push(new ObjetoRemotoVortex(objeto, _this.idOwner));
		});
		_this.alCargar();
	});
		
	vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeObjetoNuevo",
		de: this.idOwner,
		tipoDeObjeto: tipo
	}, function(aviso){
		var obj_rmt = new ObjetoRemotoVortex(aviso.datoSeguro.objeto, _this.idOwner);
		_this.objetos.push(obj_rmt);
		_this.alAgregar(obj_rmt);
	});
};

ColeccionRemotaVortex.prototype.add = function(valor_inicial){
	vx.send({
		tipoDeMensaje: "vortex.persistencia.insert",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro:{ objeto: _.extend({tipo: this.tipo}, valor_inicial)}
	});
};

ColeccionRemotaVortex.prototype.forEach = function(iterador){
	_.forEach(this.objetos, function(objeto){
		iterador(objeto);
	})
};