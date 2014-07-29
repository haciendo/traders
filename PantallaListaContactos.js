var PantallaListaContactos = {
    start: function(){		
        var _this = this;
		
        this.ui =  $("#pantalla_lista_contactos");     
        
        this.lista_contactos = this.ui.find("#lista_contactos");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			vex.dialog.prompt({
				message: 'Ingrese el id del usuario',
				placeholder: 'Id del usuario',
				callback: function(value) {
					if(value){
						Traders.agregarContacto(value);
					}
				}
			});			
		});		
		
		Contactos.onAdd(function(contacto){
			_this.add(contacto);
        });
		
		this.hide();		
    },
	
	add: function(contacto){
		var _this = this;
		var vista_contacto = new VistaDeUnContactoEnLista({
			contacto: contacto,
			seleccionado: false
		});
		
		vista_contacto.onClick(function(){
			vista_contacto.seleccionar();
		});
		
		vista_contacto.onSelect(function(){
			if(_this.vista_seleccionada) _this.vista_seleccionada.seleccionar(false);
			_this.contacto_seleccionado = contacto;
			_this.vista_seleccionada = vista_contacto;
			_this.onSelect();
		});
		
		if(!this.contacto_seleccionado) {
			vista_contacto.seleccionar();
		}
		vista_contacto.dibujarEn(this.lista_contactos);
	},
		
    onSelect: function(){
		var _this = this;
		if(!this._onSelect) this._onSelect = new Evento();
		if(_.isFunction(arguments[0])){		
			return this._onSelect.addHandler(arguments[0]);			
		}else{
			this._onSelect.disparar(arguments[0]);
		}	
	},
	
	hide: function(){
		this.ui.hide();
	},
    
	show: function(){
		this.ui.show();
	}	
//    render: function(){
//		var _this = this;
//		
////		if(!this.contacto_seleccionado){
////			this.contacto_seleccionado = Traders.contactos()[0];
////		}
//		
//        this.lista_contactos.empty();
//		
//        _.each(Traders.contactos(), function(contacto){
//			_this.add(contacto);
//		});
//
//        this.show();
//    }
};