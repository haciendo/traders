var BusquedaSocial = function(filtro){
    var _this = this;
    Evento.agregarEventoA(this, "alCargar", true);
	Evento.agregarEventoA(this, "alAgregar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alQuitar");
	Evento.agregarEventoA(this, "alApagar");
    
    this.resultados = [];
    this._pedidosVx = [];
    this._pedidosDeObjetos = [];

    this.load(filtro);
};

BusquedaSocial.prototype.load = function(filtro){
    this.filtro = filtro;	
	var _this = this;
    
    this._quitarPedidosVx();
    this._quitarPedidosDeObjetos();
    this._quitarResultados();	
	
    if(filtro.idOwner){ 
		_this._pedirAUnContacto(filtro, filtro.idOwner);
	}else{
		BS.contactos.forEach(function(contacto){
			_this._pedirAUnContacto(filtro, contacto.idContacto);
		});
	}      
};
BusquedaSocial.prototype._pedirAUnContacto = function(filtro, idContacto){
    var _this = this;
    this._pedidosVx.push(vx.send({
		tipoDeMensaje: "vortex.persistencia.agregarPedido",
		de: BS.idUsuario,
		para: idContacto,
		datoSeguro: {filtro: this.filtro}
	}, function(respuesta){
		var id_pedido = respuesta.datoSeguro.idPedido;
        _this._pedidosDeObjetos.push({idContacto: idContacto, idPedido: id_pedido});
		_.forEach(respuesta.datoSeguro.objetos, function(objeto){
			_this._agregar(objeto);
		});
        _this.alCargar();
        
		_this._pedidosVx.push(
            vx.when({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoAgregadoAPedido",
                de: idContacto,
                para: BS.idUsuario,
                idPedido: id_pedido,
            }, function(aviso){
                _this._agregar(aviso.datoSeguro.objeto);
            })
        );

        _this._pedidosVx.push(
            vx.when({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoQuitadoDePedido",
                de: idContacto,
                para: BS.idUsuario,
                idPedido: id_pedido,
            }, function(aviso){
                _this._quitar(aviso.datoSeguro.idObjeto);
            })
        );
        
        _this._pedidosVx.push(
            vx.when({
                tipoDeMensaje:"vortex.persistencia.avisoDeObjetoModificadoEnPedido",
                de: idContacto,
                para: BC.idUsuario,
                idPedido: id_pedido,
            }, function(aviso){
                var vxo = _.findWhere(_this.resultados, {id: aviso.datoSeguro.idObjeto});
                vxo.modificarSinAvisarPorVx(aviso.datoSeguro.cambios);
				_this.alCambiar(vxo, aviso.datoSeguro.cambios);
            })
        );
	}));
    
    _this._pedidosVx.push(
        vx.when({
            tipoDeMensaje:"vortex.persistencia.avisoDeRepositorioOnline",
            de: idContacto
        }, function(aviso){
            _this.load(filtro);
        })
    );
};

BusquedaSocial.prototype.insertar = function(valor_inicial){
    if(!this.filtro.idOwner) throw("no se puede insertar sin idOwner");
    if(this.filtro.idOwner != BS.idUsuario) throw("no se puede insertar en repositorios ajenos");
	vx.send({
		tipoDeMensaje: "vortex.persistencia.insert",
		de: Usuario.id,
		para: Usuario.id,
		datoSeguro:{ objeto: _.extend({}, this.filtro, valor_inicial)}
	});
};

BusquedaSocial.prototype.apagar = function(){
    this._quitarPedidosVx();
    this._quitarPedidosDeObjetos();
    this._quitarResultados();
    Evento.limpiarHandlersDeEventosDe(this);
    this.alApagar();
};
    
BusquedaSocial.prototype.forEach = function(iterador){
	_.forEach(this.resultados, function(objeto){
		iterador(objeto);
	})
};

BusquedaSocial.prototype.findWhere = function(condiciones){
	return _.findWhere(this.resultados, condiciones);
};

BusquedaSocial.prototype.where = function(condiciones){
	return _.where(this.resultados, condiciones);
};

BusquedaSocial.prototype.toArray = function(){
	return this.resultados;
};

BusquedaSocial.prototype._agregar = function(obj){
	var obj_enc = new ObjetoEncontradoEnBusqueda(obj);
	this.resultados.push(obj_enc);
	this.alAgregar(obj_enc);
};

BusquedaSocial.prototype._quitar = function(id_obj){
	var obj_quitado = _.findWhere(this.resultados, {id: id_obj});
	this.resultados = _.without(this.resultados, obj_quitado);
    obj_quitado.quitarDeLaBusqueda();
    this.alQuitar(obj_quitado);
};

BusquedaSocial.prototype._quitarPedidosVx= function(){
    _.forEach(this._pedidosVx, function(p){
        p.quitar();
    });
    this._pedidosVx = [];
};

BusquedaSocial.prototype._quitarPedidosDeObjetos= function(){
    _.forEach(this._pedidosDeObjetos, function(pedido){
        vx.send({
            tipoDeMensaje: "vortex.persistencia.quitarPedido",
            de: BS.idUsuario,
            para: pedido.idContacto,
            datoSeguro: {idPedido: pedido.idPedido}
        });
    });
    this._pedidosDeObjetos = [];
};

BusquedaSocial.prototype._quitarResultados= function(){
    var _this = this;   
    _.forEach(this.resultados, function(o){
        o.quitarDeLaBusqueda();
        _this.alQuitar(o);
    });
    this.resultados = [];
};