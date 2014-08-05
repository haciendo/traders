var Usuario = {
    start: function(opt){
		var _this = this;
        var def = {
            nombre:"novato",
            inventario:[],
            avatar:""            
        };
		_.extend(this, def, opt);
		var str_datos_guardados = localStorage.getItem(this.id);
		if(str_datos_guardados){
			var datos_usuario = JSON.parse(str_datos_guardados);
			_.extend(_this, datos_usuario);
		}
		
        vx.when({
			tipoDeMensaje:"traders.solicitudDeAmistad",
			para: this.id
		},function(mensaje){
			// le completo los datos
			vx.send({
				responseTo: mensaje.idRequest,
				para: mensaje.de,
				de: _this.id,
				datoSeguro: {
                    solicitudAceptada: true,
					contacto: {
                        id: _this.id,
						nombre: _this.nombre,
						inventario: _this.inventario,
						avatar:_this.avatar
					}
				}
			});
			
			// lo agrego
			Contactos.agregar(mensaje.datoSeguro.contacto);
		});
		
        
		this.change(function(){
			localStorage.setItem(_this.id, JSON.stringify(_this.resumenParaGuardar()));
		});
		this.change();
	},
    agregarProducto: function(p){
		p.id = this.nextProductoId();
    	var producto = new Producto(p);
		
		this.inventario.push(producto);		
		
        vx.send({
            tipoDeMensaje:"traders.avisoDeNuevoProducto",
            de: this.id,
            datoSeguro: {
                producto: producto
            }
        });
		
        this.onProductoAgregado(producto);
        this.change();
		
		return producto;
    },
    quitarProducto: function(p){
        this.inventario = $.grep(this.inventario, function(prod){
            return prod.id != p.id;
        });		
		
		vx.send({
            tipoDeMensaje:"traders.avisoDeBajaDeProducto",
            de: this.id,
            datoSeguro:{
                id_producto: p.id
            }
        });
		
        this.onProductoQuitado(p);        
        this.change();
    },
    cambiarAvatar: function(){
        this.avatar=imagen_codificada;
		vx.send({
            tipoDeMensaje:"traders.avisoDeCambioDeAvatar",
            de: this.id,
            datoSeguro: {
                avatar: imagen_codificada
            }
        });
		
		this.change();    
    },
    nextProductoId: function(){		
		var _this = this;
		var id = randomString(10);
		
		_.each(this.inventario, function(producto){
			if(producto.id == id){
				id = _this.nextProductoId();
			}
		});
		return id;		
	},
    onProductoAgregado: function(){
        var _this = this;
        if(!this._onProductoAgregado) this._onProductoAgregado = new Evento();
        if(_.isFunction(arguments[0])){		
            return this._onProductoAgregado.addHandler(arguments[0]);			
        }else{
            this._onProductoAgregado.disparar();
        }		
    },
    onProductoQuitado: function(){
        var _this = this;
        if(!this._onProductoQuitado) this._onProductoQuitado = new Evento();
        if(_.isFunction(arguments[0])){		
            return this._onProductoQuitado.addHandler(arguments[0]);			
        }else{
            this._onProductoQuitado.disparar();
        }		
    },    
    change: function(){
        var _this = this;
        if(!this._change) this._change = new Evento();
        if(_.isFunction(arguments[0])){		
            return this._change.addHandler(arguments[0]);			
        }else{
            this._change.disparar();
        }		
    },
    resumenParaGuardar: function(){
        return {
            nombre:this.nombre,
            inventario:this.inventario,
            avatar:this.avatar
        }
    }
};