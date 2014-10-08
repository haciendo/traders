var PantallaContactos = {
	start: function(){
		var _this = this;
		this.ui = $("#pantalla_contactos");	
		PantallaListaContactos.start();
		PantallaContacto.start();
		PantallaListaContactos.alSeleccionar(function(datos_contacto){
            PantallaContacto.mostrarContacto(datos_contacto);
			_this.ui.animate({scrollLeft: _this.ui.width()}, 300);
		});
	},
	show: function(){
		this.ui.show();
		this.ui.animate({scrollLeft: 0}, 300);
	},
	hide: function(){
		this.ui.hide();
	}
};