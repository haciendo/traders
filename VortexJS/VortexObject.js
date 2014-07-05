var VortexObject = vxo = function(opt){
	var _this = this;
	this._change_callbacks = [];
	this.idOwner = opt.idOwner;
	this.idAlmacenes = opt.idAlmacenes;
	this.ruta = opt.ruta || "";
	this.rsaOwner = vx.keys[this.idOwner];
	
	if(opt.valorInicial) {
		this.val(opt.valorInicial);
	}else{
		vx.send({
			tipoDeMensaje: "vortex.persistencia.get",
			de: this.idAlmacenes,
			para: this.idAlmacenes,
			datoSeguro: {
				ruta: this.ruta
			}
		}, function(mensaje){
			if(_this.rsaOwner) _this.val(Encriptador.desEncriptarObjeto(mensaje.datoSeguro.valor, _this.idOwner, _this.rsaOwner));
			else _this.val(mensaje.datoSeguro.valor);
		});
	}

	vx.when({
		tipoDeMensaje: "vortex.persistencia.set",
		de: this.idAlmacenes,
		para: this.idAlmacenes
	},function(mensaje){
		if(mensaje.datoSeguro.ruta == _this.ruta){
			if(_this.rsaOwner) _this.val(Encriptador.desEncriptarObjeto(mensaje.datoSeguro.valor, _this.idOwner, _this.rsaOwner));
			else _this.val(mensaje.datoSeguro.valor);
		}
	});
	
	vx.when({
		tipoDeMensaje: "vortex.persistencia.get",
		de: this.idAlmacenes,
		para: this.idAlmacenes
	},function(mensaje){
		if(mensaje.datoSeguro.ruta == _this.ruta){			
			var resumen = _this.resumen();
			if(!resumen) return;
			if(_this.rsaOwner) resumen = Encriptador.encriptarObjeto(resumen, _this.idOwner, _this.rsaOwner);
			vx.send({
				de: _this.idAlmacenes,
				para: _this.idAlmacenes,
				responseTo: mensaje.idRequest,
				datoSeguro: {
					ruta: _this.ruta,
					valor: resumen
				}
			});
		}
	});
};

vxo.prototype.val = function(valor){
	if(valor === undefined){ 
		return this._valor;
  	};
	if(_.isEqual(this.resumen(), valor)) return;
	
	if(typeof valor != "object") { 
		this._valor = valor;
	}else{
		if(typeof this._valor != "object"){
			this._valor = {};
		}
		for(var key in valor){
			if(!this[key]){
				this[key] = new vxo({
					valorInicial: valor[key], 
					ruta: this.ruta + "." + key, 
					idOwner: this.idOwner, 
					idSuscriptores: this.idSuscriptores});
				this._valor[key] = this[key];
			}else{
				this[key].val(valor[key]);
			}
		}
	}
	this.change();
	var resumen = this.resumen();
	if(!resumen) return;
	if(this.rsaOwner) resumen = Encriptador.encriptarObjeto(resumen, this.idOwner, this.rsaOwner);
	vx.send({
		tipoDeMensaje: "vortex.persistencia.set",
		de: this.idAlmacenes,
		para: this.idAlmacenes,
		datoSeguro: {
			ruta: this.ruta,
			valor: resumen
		}
	});

};
	
vxo.prototype.resumen = function(){
	if(typeof this._valor != "object") { 
		return this._valor;
	}else{
		var resumen = {};
		for(var key in this._valor){
			if(this._valor[key]){
				resumen[key] = this._valor[key].resumen();
			}
		}
		return resumen;
	}
};

vxo.prototype.change = function(callback){
	var _this = this;
	if(callback){		
		this._change_callbacks.push(callback);			
	}else{
		_.each(this._change_callbacks, function(evento){
			evento();
		});
	}
};