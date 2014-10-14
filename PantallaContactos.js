var PantallaContactos = {
	start: function(){
		var _this = this;
		this.ui = $("#pantalla_contactos");	
		PantallaListaContactos.start();
		PantallaContacto.start();
		PantallaListaContactos.alSeleccionar(function(idContacto){
            PantallaContacto.mostrarContacto(idContacto);
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