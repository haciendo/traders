var BusquedaEnContactos = function(filtro){
    Evento.agregarEventoA(this, "alCargar", true);
	Evento.agregarEventoA(this, "alAgregar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alQuitar");
	Evento.agregarEventoA(this, "alApagar");
    this.load(filtro);
};

BusquedaEnContactos.prototype.load = function(filtro){
    this.filtro = filtro;	
	var _this = this;
    
	this.resultados = [];
	
    if(filtro.idOwner){ 
		_this.pedirAUnContacto(filtro, filtro.idOwner);
	}else{
		BC.contactos.forEach(function(contacto){
			_this.pedirAUnContacto(filtro, contacto.idContacto);
		});
	}
       
	_this.alCargar(_this.objetos);       
};
BusquedaEnContactos.prototype._pedirAUnContacto = function(filtro, idContacto){
	 vx.send({
		tipoDeMensaje: "vortex.persistencia.agregarPedido",
		de: BC.idUsuario,
		para: idContacto,
		datoSeguro: {filtro: this.filtro}
	}, function(respuesta){
		var id_pedido = respuesta.datoSeguro.idPedido;
		_.forEach(respuesta.datoSeguro.objetos, function(objeto){
			_this._agregar(objeto);
		});

		var pedido_objeto_agregado = vx.when({
			tipoDeMensaje:"vortex.persistencia.avisoDeObjetoAgregadoAPedido",
			de: idContacto,
			para: BC.idUsuario,
			idPedido: id_pedido,
		}, function(aviso){
			_this._agregar(aviso.datoSeguro.objeto);
		});

		var pedido_objeto_quitado = vx.when({
			tipoDeMensaje:"vortex.persistencia.avisoDeObjetoQuitadoDePedido",
			de: idContacto,
			para: BC.idUsuario,
			idPedido: id_pedido,
		}, function(aviso){
			_this._quitar(aviso.datoSeguro.idObjeto);
		});

		var pedido_objeto_modificado = vx.when({
			tipoDeMensaje:"vortex.persistencia.avisoDeObjetoModificadoEnPedido",
			de: idContacto,
			para: BC.idUsuario,
			idPedido: id_pedido,
		}, function(aviso){
			var vxo = _.findWhere(_this.resultados, {id: aviso.datoSeguro.idObjeto});
			vxo.modificarSinAvisarPorVx(aviso.datoSeguro.cambios);
		});
		
		_this.alApagar(function(){
			pedido_objeto_agregado.quitar();
			pedido_objeto_quitado.quitar();
			pedido_objeto_modificado.quitar();
			vx.send({
				tipoDeMensaje: "vortex.persistencia.quitarPedido",
				de: BC.idUsuario,
				para: idContacto,
				datoSeguro: {idPedido: id_pedido}
			}
		});
	});
};

BusquedaEnContactos.prototype.crear = function(valor_inicial){
    if(!this.filtro.idOwner) return;
    if(this.filtro.idOwner != BC.idUsuario) return;
	vx.send({
		tipoDeMensaje: "vortex.persistencia.insert",
		de: Usuario.id,
		para: Usuario.id,
		datoSeguro:{ objeto: _.extend({}, this.filtro, valor_inicial)}
	});
};

BusquedaEnContactos.prototype.forEach = function(iterador){
	_.forEach(this.objetos, function(objeto){
		iterador(objeto);
	})
};

BusquedaEnContactos.prototype._agregar = function(obj){
	var _this = this;
	if(_.findWhere(_this.objetos, {id: obj.id})) return;
	var obj_bus = new ObjetoBuscado(obj);
	this.objetos.push(obj_bus);
	this.alAgregar(obj_bus);
};

BusquedaEnContactos.prototype._quitar = function(id_obj){
	var obj_elim = _.findWhere(this.resultados, {id: id_obj});
	this.resultados = _.without(this.resultados, obj_elim);
    this.alEliminar(obj_elim);
};