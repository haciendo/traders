var PantallaUsuario = {
    start: function(opt){
        _.extend(this, opt);
        var _this = this;
        this.ui =  $("#pantalla_usuario");
        
        this.panel_inventario = this.ui.find("#panel_inventario");
        this.lbl_nombre_usuario = this.ui.find("#lbl_nombre_usuario");        
		this.img_avatar_usuario = this.ui.find("#avatar_usuario");
		
		
		this.productos = vx.get({tipo:"Producto", idOwner: Usuario.id});
        
        this.lbl_nombre_usuario.text(this.datosUsuario.nombre);
		this.img_avatar_usuario.attr("src", this.datosUsuario.avatar);
        
		this.datosUsuario.alCambiar(function(cambios){
			if(cambios.nombre) _this.lbl_nombre_usuario.text(cambios.nombre);
			if(cambios.avatar) _this.img_avatar_usuario.attr("src", cambios.avatar);
		});
		
        this.lbl_nombre_usuario.click(function(){
            vex.dialog.prompt({
				message: 'Ingresá tu nuevo alias',
				value: _this.datosUsuario.nombre,
				callback: function(value) {
					if(value){
						_this.datosUsuario.nombre = value;
					}
				}
			});
        });
        
        this.txt_nombre_producto_add = this.ui.find("#txt_nombre_producto_add");
        this.btn_add_producto = this.ui.find("#btn_add_producto");
        this.btn_add_producto.click(function(){
			_this.productos.crear({
				nombre: _this.txt_nombre_producto_add.val()
			});
            _this.txt_nombre_producto_add.val("");
        }); 
		
		this.txt_nombre_producto_add.keypress(function(e) {
			if(e.which == 13) {
				_this.btn_add_producto.click();
			}
		});    
        
		this.btn_compartir_id = this.ui.find("#btn_compartir_id");
		this.btn_compartir_id.click(function(){
			vex.dialog.prompt({
				message: 'Compartí tu id',
				value: Usuario.id,
				callback: function(value) {
					if(value){
						clipboardCopy(Usuario.id);
					}
				}
			});
		});
		
        this.video_para_sacar_foto= this.ui.find("#video_para_sacar_foto")[0];
		var video_stream;
        this.img_avatar_usuario.click(function(){		            
            var width = 100;
            var height = 100;
            var streaming = false;
            
            var errBack = function(error) {
                    console.log("Video capture error: ", error.code); 
                };
            
            navigator.getMedia = ( navigator.getUserMedia || 
                                    navigator.webkitGetUserMedia ||
                                    navigator.mozGetUserMedia ||
                                    navigator.msGetUserMedia);

            navigator.getMedia(
                { 
                    video: true, 
                    audio: false 
                },
                function(stream) {
                    video_stream = stream;
                    if (navigator.mozGetUserMedia) { 
                        _this.video_para_sacar_foto.mozSrcObject = stream;
                    } else {
                        var vendorURL = window.URL || window.webkitURL;
                        _this.video_para_sacar_foto.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
                    }
                    _this.video_para_sacar_foto.play();
                    $(_this.video_para_sacar_foto).show();
                    _this.img_avatar_usuario.hide();
                },
                function(err) {
                    console.log("An error occured! " + err);
                }
            );
        });
        
        $(this.video_para_sacar_foto).click(function(){
            var canvas = $('<canvas>')[0];
            var ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 100;
            var alto_rec_video = _this.video_para_sacar_foto.videoHeight;
            var x_rec = (_this.video_para_sacar_foto.videoWidth - alto_rec_video)/2;
            canvas.getContext('2d').drawImage(_this.video_para_sacar_foto, x_rec, 0, alto_rec_video, alto_rec_video, 0, 0, 100, 100);
            var imagen_serializada = canvas.toDataURL('image/jpeg');
            _this.img_avatar_usuario.attr("src", imagen_serializada);
			_this.datosUsuario.avatar = imagen_serializada;
            $(_this.video_para_sacar_foto).hide();
            _this.img_avatar_usuario.show();
            _this.video_para_sacar_foto.pause();
            video_stream.stop();
        });
        
        this.inventario_usuario = new ListaProductos({
            productos: this.productos,
            mostrarBotonQuitar: true
        });        
        this.inventario_usuario.alSeleccionarProducto(function(producto){
            var pantalla_edicion = new PantallaEdicionProducto(producto);
        });        
        this.inventario_usuario.alQuitarProducto(function(producto){
            producto.eliminar();
        });
        
        this.inventario_usuario.dibujarEn(this.panel_inventario);	
		
    },
    show: function(){  
		this.txt_nombre_producto_add.focus();
        this.ui.show();      
    },
	hide: function(){  
        this.ui.hide();      
    }
};