var PantallaContactos = {
	start:function(){
		var _this = this;
		this.ui = $("#pantalla_contactos");	
		PantallaListaContactos.start();
		PantallaContacto.start();
		PantallaListaContactos.onSelect(function(){
			_this.ui.animate({scrollLeft: _this.ui.width()}, 300);
			PantallaContacto.setContacto(PantallaListaContactos.contacto_seleccionado);
		});
	},
	show:function(){
		this.ui.show();
		this.ui.animate({scrollLeft: 0}, 300);
	}
};