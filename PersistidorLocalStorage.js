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
	
	vx.when({
		filtro: {
				tipoDeMensaje: "vortex.persistencia.guardarDatos",
				de: _this.contacto_id,
				para: _this.usuario_id
			},
		callback: function(mensaje){

			var estado = 'ERROR';

			//estado = 'DENEGADO';

			if(typeof(Storage)!=="undefined"){
				localStorage.setItem(_this.contacto_id, JSON.stringify(mensaje.datoSeguro));
				estado = 'OK';
			}

			vx.send({
				responseTo: mensaje.idRequest,
				de: _this.usuario_id,
				para: _this.contacto_id,
				descripcion: 'LocalStorage',
				datoSeguro: {
					estado:estado
				}
			});
		}
	});
	
	
	vx.when({
		filtro: {
			tipoDeMensaje:"vortex.persistencia.obtenerDatos",
			de: _this.contacto_id,
			para: _this.usuario_id
		},
		callback: function(mensaje){

			var estado = 'ERROR';
			//estado = 'DENEGADO';

			var datos;

			if(typeof(Storage)!=="undefined"){
				datos = localStorage.getItem(_this.usuario_id);
				if(datos){
					estado = 'OK';
				}
				datos = JSON.parse(datos);
			}

			var obj = {
				responseTo: mensaje.idRequest,
				de: _this.usuario_id,
				para: _this.contacto_id,
				descripcion: 'LocalStorage',
				estado: estado,
				datoSeguro: {
					estado: estado,
					datos: datos
				}
				
			};
			vx.send(obj);
		}
	});	
};
