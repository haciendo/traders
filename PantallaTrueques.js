var PantallaTrueques = {
	start:function(){
		var _this = this;
		this.ui = $("#pantalla_trueques");	
		PantallaListaTrueques.start();
		//PantallaTrueque.start();
		PantallaListaTrueques.alSeleccionar(function(){
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