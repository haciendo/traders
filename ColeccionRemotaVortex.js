var ColeccionRemotaVortex = function(filtro, id_owner, opt){
	var _this = this;
	this.opt  = _.extend({}, opt);
    this.objetos = [];
    
	Evento.agregarEventoA(this, "alCargar", true);
	Evento.agregarEventoA(this, "alAgregar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alQuitar");
	
	this.load(filtro, id_owner);
};

ColeccionRemotaVortex.prototype.load = function(filtro, id_owner, opt){
    this.filtro = filtro;
	this.idOwner = id_owner;
	var _this = this;
    
    this.forEach(function(vxo){
        _this._quitar(vxo);
    });
	vx.send({
		tipoDeMensaje: "vortex.persistencia.select",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro: {filtro: this.filtro}
	}, function(respuesta){
		_.forEach(respuesta.datoSeguro.objetos, function(objeto){
			_this._agregar(objeto);
		});
		_this.alCargar(_this.objetos);
	});
    
    if(this.new_obj_hnd) this.new_obj_hnd.quitar();
    this.new_obj_hnd = vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeObjetoNuevo",
		de: this.idOwner,
		tipoDeObjeto: filtro.tipo
	}, function(aviso){
		_this._agregar(aviso.datoSeguro.objeto);
	});
                            
	if(this.conexion_hnd) this.conexion_hnd.quitar();
	this.conexion_hnd = vx.when({
		tipoDeMensaje:"vortex.persistencia.avisoDeRepositorioOnline",
		de: this.idOwner
	}, function(aviso){
		_this.load(_this.filtro, _this.idOwner);
	});
};

ColeccionRemotaVortex.prototype.crear = function(valor_inicial){
	vx.send({
		tipoDeMensaje: "vortex.persistencia.insert",
		de: Usuario.id,
		para: this.idOwner,
		datoSeguro:{ objeto: _.extend({}, this.filtro, valor_inicial)}
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
	var vxo = vx.get({id: obj.id, idOwner: this.idOwner}, {valorInicial: obj});
	var modificar_hnd = vxo.alCambiar(function(cambios){
		if(_this._elObjetoPasaElFiltro(vxo)) {
			_this.alCambiar(vxo, cambios);	
			return;
		}
		_this._quitar(vxo);
	});
    var quitar_hnd = vxo.alDesconectar(function(){
        modificar_hnd.quitar();
        quitar_hnd.quitar();
        _this.objetos = _.without(_this.objetos, vxo);
        _this.alQuitar(vxo);
    });
    
	this.objetos.push(vxo);
	this.alAgregar(vxo);
};

ColeccionRemotaVortex.prototype._quitar = function(obj){
	var vxo = _.findWhere(this.objetos, {id: obj.id});
	if(!vxo) return;
    vxo.desconectar();
};