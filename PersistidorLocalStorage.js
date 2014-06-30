var PersistidorLocalStorage = function(opt){
	var _this = this;    
	
	var optDefault = {
		usuario_id: null,
		contacto_id: null
	};
	
	$.extend(true, optDefault, opt);	
	$.extend(true, this, optDefault);	
	
	if(!this.contacto_id){
		this.contacto_id = this.usuario_id
	}	
	
	if(typeof(localStorage)=="undefined") return; //no existe el storage local, me voy
	
	this.objetoGuardado = JSON.parse(localStorage.getItem(_this.usuario_id));	
	
	vx.when({
				tipoDeMensaje: "vortex.persistencia.guardarDatos",
				de: _this.contacto_id,
				para: _this.usuario_id
			}, function(mensaje){
				var ruta = mensaje.datoSeguro.ruta;	

				var ruta_spliteada = ruta.split(".");
				var objeto_navegado = _this.objetoGuardado;
				for(var i=0; i<ruta_spliteada.length-1;i++){
					var key = ruta_spliteada[i];
					if(objeto_navegado[key]=== undefined) objeto_navegado[key] = {};
					objeto_navegado = objeto_navegado[key];
				}
				objeto_navegado[_.last(ruta_spliteada)] = mensaje.datoSeguro.valor;
				localStorage.setItem(_this.contacto_id, JSON.stringify(_this.objetoGuardado));
			});
	
	
	vx.when({
			tipoDeMensaje:"vortex.persistencia.obtenerDatos",
			de: _this.contacto_id,
			para: _this.usuario_id
		},function(mensaje){
			var estado = 'ERROR';

			if(_this.objetoGuardado){
				estado = 'OK';
			}
			
			var obj = {
				responseTo: mensaje.idRequest,
				de: _this.usuario_id,
				para: _this.contacto_id,
				descripcion: 'LocalStorage',
				estado: estado,
				datoSeguro: _this.getObjetoDeRuta(mensaje.datoSeguro.ruta)														
			};
			vx.send(obj);
		});	
	
	vx.when({
			tipoDeMensaje:"vortex.persistencia.eliminarDatos",
			de: _this.contacto_id,
			para: _this.usuario_id
		},function(mensaje){
			var estado = 'ERROR';
			var ruta = mensaje.datoSeguro.ruta;
			
			if(_this.objetoGuardado){
				estado = 'OK';
			}
			
			if(ruta == "") {
				_this.objetoGuardado = {};
				return;
			}
			
			var ruta_spliteada = ruta.split(".");
			var objeto_navegado = _this.objetoGuardado;
			for(var i=0; i<ruta_spliteada.length-1;i++){
				var key = ruta_spliteada[i];
				objeto_navegado = objeto_navegado[key];
			}
			delete objeto_navegado[ruta_spliteada[ruta_spliteada.length-1]];
			
			localStorage.setItem(_this.contacto_id, JSON.stringify(_this.objetoGuardado));
		});	
};

PersistidorLocalStorage.prototype.getObjetoDeRuta = function(ruta){
	var ruta_spliteada = ruta.split(".");
	var objeto_navegado = this.objetoGuardado;
	if(ruta!=""){
		_.each(ruta_spliteada, function(key){
			objeto_navegado = objeto_navegado[key];
		});
	}
	return objeto_navegado;
};