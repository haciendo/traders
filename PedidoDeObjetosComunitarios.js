var PedidoDeObjetosComunitarios = function(filtro){
    Evento.agregarEventoA(this, "alCargar", true);
	Evento.agregarEventoA(this, "alAgregar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alQuitar");
    this.load(filtro);
};

PedidoDeObjetosComunitarios.prototype.load = function(filtro){
    this.filtro = filtro;	
	var _this = this;
    
    if(filtro.idOwner){
        vx.send({
            tipoDeMensaje: "vortex.persistencia.agregarPedido",
            de: co.idUsuario,
            para: filtro.idOwner,
            datoSeguro: {filtro: this.filtro}
        }, function(respuesta){
            _this.idPedido = respuesta.datoSeguro.idPedido;
            _.forEach(respuesta.datoSeguro.objetos, function(objeto){
                _this._agregar(objeto);
            });
            
            vx.when({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoAgregadoAPedido",
                de: filtro.idOwner,
                para: co.idUsuario,
                idPedido: _this.idPedido,
            }, function(aviso){
                _this._agregar(aviso.datoSeguro.objeto);
            });
                
            vx.when({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoQuitadoDePedido",
                de: filtro.idOwner,
                para: co.idUsuario,
                idPedido: _this.idPedido,
            }, function(aviso){
                _this._quitar(aviso.datoSeguro.idObjeto);
            });
            
            vx.when({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoModificadoEnPedido",
                de: filtro.idOwner,
                para: co.idUsuario,
                idPedido: _this.idPedido,
            }, function(aviso){
                var vxo = _.findWhere(_this.objetos, {id: aviso.datoSeguro.idObjeto});
                vxo.modificarSinAvisarPorVx(aviso.datoSeguro.cambios);
            });
            _this.alCargar(_this.objetos);
        });        
    }
};

PedidoDeObjetosComunitarios.prototype.crear = function(valor_inicial){
    if(!filtro.idOwner) return;
    if(filtro.idOwner != Usuario.id) return;
	vx.send({
		tipoDeMensaje: "vortex.persistencia.insert",
		de: Usuario.id,
		para: Usuario.id,
		datoSeguro:{ objeto: _.extend({}, this.filtro, valor_inicial)}
	});
};

PedidoDeObjetosComunitarios.prototype.forEach = function(iterador){
	_.forEach(this.objetos, function(objeto){
		iterador(objeto);
	})
};

PedidoDeObjetosComunitarios.prototype._agregar = function(obj){
	var _this = this;
	if(_.findWhere(_this.objetos, {id: obj.id})) return;
	var vxo = vx.get({id: obj.id, idOwner: this.idOwner}, {valorInicial: obj});
	var modificar_hnd = vxo.alCambiar(function(cambios){
        _this.alCambiar(vxo, cambios);	
	});
	this.objetos.push(vxo);
	this.alAgregar(vxo);
};

PedidoDeObjetosComunitarios.prototype._quitar = function(obj){
	var vxo = _.findWhere(this.objetos, {id: obj.id});
    throw "puta madre me olvide de quitar";
};