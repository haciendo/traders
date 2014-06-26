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
	
	this.objetoGuardado = localStorage.getItem(_this.usuario_id);	
	
	vx.when({
				tipoDeMensaje: "vortex.persistencia.guardarDatos",
				de: _this.contacto_id,
				para: _this.usuario_id
			}, function(mensaje){
				_this.objetoGuardado = mensaje.datoSeguro.valor;				
				localStorage.setItem(_this.contacto_id, _this.objetoGuardado);

				vx.send({
					responseTo: mensaje.idRequest,
					de: _this.usuario_id,
					para: _this.contacto_id,
					descripcion: 'LocalStorage',
					estado: 'OK'
				});
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
				datoSeguro: _this.objetoGuardado														
			};
			vx.send(obj);
		});	
};
