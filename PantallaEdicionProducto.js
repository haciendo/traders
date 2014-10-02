var PantallaEdicionProducto = function(producto){
	var _this = this;
	this.ui = $("#plantillas .pantalla_edicion_producto").clone();
	this.txt_nombre_producto = this.ui.find("#txt_nombre_producto");
	this.txt_nombre_producto.change(function(){
		vx.send({
			tipoDeMensaje: "traders.modificarProducto",
			de: Usuario.id,
			para: Usuario.id,
			datoSeguro: {
				idProducto: producto.id,
				cambios: {					
					nombre: _this.txt_nombre_producto.val()
				}
			}
		});
	});
	
    this.imagen_producto = this.ui.find("#imagen_producto");
    
    this.imagen_producto.click(function(){
        var fileInputImagenes = $('<input type="file" />')[0];
        fileInputImagenes.addEventListener("change", function () {
            var file = fileInputImagenes.files[0];
            url = window.URL || window.webkitURL;
            src = url.createObjectURL(file);
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var img = new Image;
            img.crossOrigin = 'Anonymous';
            img.src = src;
            img.onload = function () {
                canvas.height = 100;
                canvas.width = 100;
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 100, 100);
                var bytes_imagen = canvas.toDataURL('image/jpg');        
                producto.imagen = bytes_imagen;
                vx.send({
					tipoDeMensaje: "traders.modificarProducto",
					de: Usuario.id,
					para: Usuario.id,
					datoSeguro: {
						cambios: {
							id: producto.id,
							imagen: bytes_imagen
						}
					}
				});
            };
        }, false);
        $(fileInputImagenes).click();
    });
    
	var pedido_modificacion = vx.when({
		de: Usuario.id,
		tipoDeMensaje:"traders.avisoDeModificacionDeProducto",
		idProducto: producto.id		
	}, function(aviso){
		var cambios = aviso.datoSeguro.cambios;
		if(cambios.nombre) _this.txt_nombre_producto.val(cambios.nombre);
		if(cambios.imagen) _this.imagen_producto.attr("src", cambios.imagen);
	});
	
	var pedido_eliminacion = vx.when({
		de: Usuario.id,
		tipoDeMensaje:"traders.avisoDeEliminacionDeProducto",
		idProducto: producto.id		
	}, function(aviso){
		vex.close(_this.idVex);
	});
	
	this.txt_nombre_producto.val(producto.nombre);
    if(producto.imagen) this.imagen_producto.attr("src", producto.imagen);
    else this.imagen_producto.attr("src", "Gift-icon-grande.png");
	
	vex.open({
		afterOpen: function($vexContent) {
			_this.idVex = $vexContent.data().vex.id;
			return $vexContent.append(_this.ui);
		},
		afterClose: function(){
			pedido_modificacion.quitar();
			pedido_eliminacion.quitar();
		}
	});
};