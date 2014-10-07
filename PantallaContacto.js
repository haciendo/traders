var PantallaContacto = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_contacto");     
        	
        this.panel_contacto = this.ui.find("#panel_contacto");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
		this.img_avatar_contacto = this.ui.find("#avatar_contacto");		
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_trocar = this.ui.find("#btn_trocar");
		
        
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
		
//		this.inventario_contacto = new ListaProductos({
//            selector:{}
//        });
		this.inventario_contacto.dibujarEn(this.panel_inventario_contacto);
    },
	mostrarContacto: function(contacto){
        var _this = this;        
		if(contacto === undefined) {
			this.panel_contacto.hide();
			return;
		}
		
        this.lbl_nombre_contacto.text(contacto.nombre);
		
		if(contacto.avatar!="") this.img_avatar_contacto.attr("src", _contacto.avatar);
		else this.img_avatar_contacto.attr("src", "avatar_default.png");
		
		this.inventario_contacto.setSelector({propietario:_contacto});
		this.inventario_contacto.render();
    },
    render: function(){
        this.panel_contacto.show();  
        this.ui.show();
    }
};