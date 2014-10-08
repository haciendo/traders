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
		this.productosContacto = new ColeccionRemotaVortex({tipo: "TUVIEJA"}, 1111);         
		this.inventarioContacto = new ListaProductos({
            productos: this.productosContacto
        });        
        this.inventarioContacto.dibujarEn(this.panel_inventario_contacto);
    },
	mostrarContacto: function(datos_contacto){
        var _this = this;        
        this.productosContacto.load({tipo: "Producto"}, datos_contacto.idUsuario);        
        this.lbl_nombre_contacto.text(datos_contacto.nombre);
		this.img_avatar_contacto.attr("src", datos_contacto.avatar);
    },
    render: function(){
        this.panel_contacto.show();  
        this.ui.show();
    }
};