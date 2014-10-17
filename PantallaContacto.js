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
        
        this.btn_trocar.click(function(e) {
            _this.ui.hide();
			
			// TO DO: agregar los productos seleccionados al trueque
			
			var trueque = Traders.nuevoTrueque({
				contacto: PantallaListaContactos.contacto_seleccionado
			});
			
			PantallaListaTrueques.trueque_seleccionado = trueque;
			PantallaListaTrueques.add(trueque);
			
			BarraSuperior.solapa_trueques.click();
		});	
		
		this.btn_aprobar = this.ui.find("#btn_aprobar");    		
		this.btn_aprobar.click(function(){
			_this.solicitud.estado = "Aprobando";
		});
		
		this.productosContacto = BC.buscar({tipo: "TUVIEJA", idOwner: 1111});         
		this.inventarioContacto = new ListaProductos({
            productos: this.productosContacto
        });        
        this.inventarioContacto.dibujarEn(this.panel_inventario_contacto);
    },
	mostrarContacto: function(idContacto){
        var _this = this; 
		this.btn_aprobar.show();
		this.btn_trocar.hide();
		if(this.busq_solicitud) this.busq_solicitud.apagar();
		this.busq_solicitud = BC.buscar({tipo: "SolicitudDeAmistad", idOwner: BC.idUsuario, idContacto: idContacto});
		this.busq_solicitud.alCargar(function(obj){
			_this.solicitud = _this.busq_solicitud.resultados[0];
			if(_this.solicitud.estado == "Recibida") _this.btn_aprobar.show();
			if(_this.solicitud.estado == "Aprobada") _this.btn_trocar.show();
            
            _this.solicitud.alCambiar(function(cambios){
                if(cambios.estado == "Recibida") {
                    _this.btn_aprobar.show();
                    _this.btn_trocar.hide();
                }
                if(cambios.estado == "Aprobada")  {
                    _this.btn_aprobar.hide();
                    _this.btn_trocar.show();
                }
            });
		});		
		
		if(this.busq_datosContacto) this.datosContacto.apagar();
		this.busq_datosContacto = BC.buscar({id: "DATOS_PERSONALES", idOwner: idContacto});
		this.busq_datosContacto.alCargar(function(){
            _this.datosContacto = _this.busq_datosContacto.resultados[0];
			_this.lbl_nombre_contacto.text(_this.datosContacto.nombre);
			_this.img_avatar_contacto.attr("src", _this.datosContacto.avatar);			
		});                
		this.productosContacto.load({tipo: "Producto"}, idContacto);
    },
    render: function(){
        this.panel_contacto.show();  
        this.ui.show();
    }
};