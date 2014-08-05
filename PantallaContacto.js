var PantallaContacto = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_contacto");     
        this.ultimo_handler = {remove: function(){}}; 			
		
        this.panel_contacto = this.ui.find("#panel_contacto");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
		this.img_avatar_contacto = this.ui.find("#avatar_contacto");
		
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_trocar = this.ui.find("#btn_trocar");
		
        this.btn_trocar.click(function(e) {
            _this.ui.hide();
			
			// TO DO: agregar los productos seleccionados al trueque
			
			var trueque = Traders.nuevoTrueque({
				contacto: _this.contacto
			});
			
			PantallaListaTrueques.trueque_seleccionado = trueque;
			PantallaListaTrueques.add(trueque);
			
			BarraSuperior.solapa_trueques.click();
		});	
		
		this.inventario_contacto = new ListaProductos({
            selector:{}
        });
		this.inventario_contacto.dibujarEn(this.panel_inventario_contacto);
    },
	show: function(){
		this.ui.show();	
		this.panel_contacto.show();  
	},
	setContacto: function(contacto){
		var _this = this;
		this._contacto = contacto;
		this.ultimo_handler.remove();
		this.ultimo_handler = contacto.change(function(){
			_this.render();
		});
		this.render();
	},
    render: function(){
        var _this = this;
		
        this.lbl_nombre_contacto.text(this._contacto.nombre);		
		if(this._contacto.avatar!="") this.img_avatar_contacto.attr("src", this._contacto.avatar);
		else this.img_avatar_contacto.attr("src", "avatar_default.png");
		
		this.inventario_contacto.setSelector({propietario:this._contacto});
		this.inventario_contacto.render();              
    }
};