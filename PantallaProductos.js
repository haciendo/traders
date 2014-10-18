var PantallaProductos = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_productos");     		
	
		this.busq_productos = BC.buscar({tipo: "Producto"});         
		this.listaProductos = new ListaProductos({
			productos: this.busq_productos,
			mostrarPropietario:true
		});        
		this.listaProductos.dibujarEn(this.ui);
    },	
    show: function(){
		this.ui.show();
		this.ui.animate({scrollLeft: 0}, 300);
	},
	hide: function(){
		this.ui.hide();
	}
};