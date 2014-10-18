var BarraSuperior = {
    start : function(opt){
        _.extend(this, opt);
        var _this = this;
		
        this.ui = $("#barra_superior");
			
		this.solapa_yo 			= this.ui.find("#solapa_yo");
		this.solapa_contactos 	= this.ui.find("#solapa_contactos");
		this.solapa_trueques 	= this.ui.find("#solapa_trueques");
		this.solapa_productos 	= this.ui.find("#solapa_productos");
		this.solapa_vortex 		= this.ui.find("#solapa_vortex");
		
		this.avatar_usuario = this.solapa_yo.find("img");
		
		this.ui.find(".solapa").on('click', function(){
			//$('div.pantalla').hide();
			_this.ui.find('.solapa').removeClass('solapa_selected');
			$(this).addClass('solapa_selected',1000);
		});
		
        this.datosUsuario.alCambiar(function(cambios){
			if(cambios.avatar) _this.avatar_usuario.attr("src", cambios.avatar);
		});
				
		this.solapa_yo.click(function(e) {
			PantallaUsuario.show();
			PantallaContactos.hide();
			PantallaProductos.hide();
		});		
		
		this.solapa_contactos.click(function(e) {
			PantallaUsuario.hide();
			PantallaContactos.show();
			PantallaProductos.hide();
		});	
		
		this.solapa_trueques.click(function(e) {
			PantallaTrueques.render();
		});	
		
		this.solapa_productos.click(function(e) {
			PantallaUsuario.hide();
			PantallaContactos.hide();
			PantallaProductos.show();
		});	

		this.solapa_vortex.click(function(e) {
			PantallaListaConexiones.render();
		});	
		
    },
	render: function(){
        this.ui.show();
    }
};