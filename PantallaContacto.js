var PantallaContacto = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_contacto");     
        
		PantallaListaContactos.onSelect(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
		});
		
		
		
        this.panel_contacto = this.ui.find("#panel_contacto");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
		
		
		//this.txt_id_contacto_add = this.ui.find("#txt_id_contacto_add");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			
			alertify.prompt("Ingrese el id del usuario", function (e, str) {
				if(e){
					Traders.agregarContacto(str);
				} else {
					// user clicked "cancel"
				}
			}, "");
		});
		
		
		
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_trocar = this.ui.find("#btn_trocar");
		
        this.btn_trocar.click(function(e) {
            _this.ui.hide();
            PantallaTrueque.contacto = PantallaListaContactos.contacto_seleccionado;
			
            PantallaTrueque.render();
		});	
    },
	
    render: function(){
        var _this = this;
        
		
		//PantallaListaContactos.render();
		var _contacto = PantallaListaContactos.contacto_seleccionado;
        
        this.lbl_nombre_contacto.text(_contacto.nombre);
        this.panel_inventario_contacto.empty();
        _.each(_contacto.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
            vista.dibujarEn(_this.panel_inventario_contacto);
        });
        
        if(_contacto.id == "") this.panel_contacto.hide();
        else this.panel_contacto.show();
        
        Traders.onNovedades(function(){
            _this.render();
        });  
        
        this.ui.show();
    }
};