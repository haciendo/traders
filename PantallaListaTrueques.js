var PantallaListaTrueques = {
    start: function(){		
        var _this = this;		
		Evento.agregarEventoA(this, "alSeleccionar");		
        this.ui =  $("#pantalla_lista_trueques");            
		this.lista_trueques = this.ui.find("#lista_trueques");
		
		this.trueques = BS.buscar({tipo: "traders.trueque", idOwner: Usuario.id});
		this.trueques.alAgregar(function(trueque){
			_this.agregarVistaTrueque(trueque.idContacto);
		});
    },
	
	agregarVistaTrueque: function(trueque){
		var _this = this;
		
		var $trueque_en_lista = $("#plantillas .trueque_en_lista").clone();

		var btn_eliminar = $trueque_en_lista.find("#btn_eliminar");
		btn_eliminar.click(function(e){
			$trueque_en_lista.remove();
		});
		
		$trueque_en_lista.click(function(){
			_this.trueque_seleccionado = trueque;
			_this.lista_trueques.find('.trueque_en_lista').removeClass("trueque_seleccionado");
			
			$(this).addClass("trueque_seleccionado");

			_this.alSeleccionar(trueque);
		});
		
		var lbl_nombre = $trueque_en_lista.find("#nombre");
		var busq_datos_contacto = BS.buscar({id: "DATOS_PERSONALES", idOwner: trueque.idContacto});
		busq_datos_contacto.alAgregar(function(datos_contacto){
			lbl_nombre.text(datos_contacto.nombre);
        
			datos_contacto.alCambiar(function(cambios){
				if(cambios.nombre) lbl_nombre.text(cambios.nombre);
			});
		});	
	
		this.lista_trueques.append($trueque_en_lista);		
	}
};