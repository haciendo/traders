var ColeccionRemotaVortex = function(tipo, owner){
	var _this = this;
	vx.send({
		tipoDeMensaje: "vortex.persistencia.select",
		de: Usuario.id,
		para: owner,
		datoSeguro: {filtro: {tipo: tipo}}
	}, function(respuesta){
		_.forEach(respuesta.datoSeguro.objetos, function(objeto){
			_this.objetos.push(new ObjetoRemotoVortex(objeto, owner));
		});
		_this.onLoad();
	});
		
	vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeObjetoNuevo",
		de: this.selector.propietario,
		tipoDeObjeto: tipo
	}, function(aviso){
		var obj_rmt = new ObjetoRemotoVortex(objeto, owner);
		_this.objetos.push(obj_rmt);
		_this.onObjetoAgregado(obj_rmt);
	});
};

