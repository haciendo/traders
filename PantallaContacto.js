var PantallaContacto = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_contacto");     
        	
        this.panel_contacto = this.ui.find("#panel_contacto");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
		this.img_avatar_contacto = this.ui.find("#avatar_contacto");		
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_trocar = this.ui.find("#btn_trocar");
		this.btn_trocar.hide();
        
		this.lbl_nombre_contacto.hide();
		this.img_avatar_contacto.hide();
		
        this.btn_trocar.click(function(e) {
			// TO DO: agregar los productos seleccionados al trueque
			vx.send({
				tipoDeMensaje: "vortex.persistencia.insert",
				de: Usuario.id,
				para: Usuario.id,
				datoSeguro:{ objeto: {
					idOwner: BC.idUsuario,
					idContacto: _this.idContacto,
					tipo: "traders.trueque"
				}}
			});
			BarraSuperior.solapa_trueques.click();
		});	
		
		this.btn_aprobar = this.ui.find("#btn_aprobar");    		
		this.btn_aprobar.click(function(){
			_this.solicitud.estado = "Aprobando";
		});
		this.btn_aprobar.hide();
    },
	mostrarContacto: function(idContacto){
        var _this = this; 
		
		this.idContacto = idContacto;
		if(!this.busq_solicitud) {
			this.busq_solicitud = BS.buscar({tipo: "SolicitudDeAmistad", idOwner: BS.idUsuario, idContacto: idContacto});
			
			this.busq_solicitud.alAgregar(function(solicitud){
				_this.solicitud = solicitud;
				_this.btn_trocar.hide();
				_this.btn_aprobar.hide();
				
				if(solicitud.estado == "Recibida") _this.btn_aprobar.show();
				if(solicitud.estado == "Aprobada") _this.btn_trocar.show();

				solicitud.alCambiar(function(cambios){	
					_this.btn_trocar.hide();
					_this.btn_aprobar.hide();
					if(cambios.estado == "Recibida") {
						_this.btn_aprobar.show();
					}
					if(cambios.estado == "Aprobada")  {
						_this.btn_trocar.show();
					}
				});
			});	
			this.busq_solicitud.alQuitar(function(solicitud){
				_this.btn_trocar.hide();
				_this.btn_aprobar.hide();
			});	
		}
		else this.busq_solicitud.load({tipo: "SolicitudDeAmistad", idOwner: BS.idUsuario, idContacto: idContacto});
		
		
		if(!this.busq_datosContacto) {
			this.busq_datosContacto = BS.buscar({id: "DATOS_PERSONALES", idOwner: idContacto});
			this.busq_datosContacto.alAgregar(function(datos_contacto){
				_this.lbl_nombre_contacto.show();
				_this.img_avatar_contacto.show();	
				_this.lbl_nombre_contacto.text(datos_contacto.nombre);
				_this.img_avatar_contacto.attr("src", datos_contacto.avatar);		
				datos_contacto.alCambiar(function(cambios){	
					if(cambios.nombre) _this.lbl_nombre_contacto.text(cambios.nombre);
					if(cambios.avatar)_this.img_avatar_contacto.attr("src", cambios.avatar);		
				});
			}); 
			this.busq_datosContacto.alQuitar(function(datos_contacto){
				_this.lbl_nombre_contacto.hide();
				_this.img_avatar_contacto.hide();			
			}); 
		}else this.busq_datosContacto.load({id: "DATOS_PERSONALES", idOwner: idContacto});
		               
		
		if(!this.busq_productos_contacto){
			this.busq_productos_contacto = BS.buscar({tipo: "Producto", idOwner: idContacto});         
			this.inventarioContacto = new ListaProductos({
				productos: this.busq_productos_contacto
			});        
			this.inventarioContacto.dibujarEn(this.panel_inventario_contacto);
		}else this.busq_productos_contacto.load({tipo: "Producto", idOwner: idContacto});
    },
    render: function(){
        this.panel_contacto.show();  
        this.ui.show();
    }
};