var Usuario = {
    start: function(opt){
		var _this = this;
        var def = {
            nombre:"novato",
            altas:[],
            avatar:""            
        };
		_.extend(this, def, opt);
        
		this._inventario = [];
        this.claveLectura = Encriptador.claveAnonima;
        
		var str_datos_guardados = Persistidor.get(this.id);
		if(str_datos_guardados){
			var datos_usuario = JSON.parse(str_datos_guardados);
			_this.nombre = datos_usuario.nombre;
			_this.avatar = datos_usuario.avatar;
            _this.altas = datos_usuario.altas;
            
			_.each(_this.altas, function(un_alta){
                var producto = _this._agregarProducto(un_alta);       
                _this.onProductoAgregado(producto);
			});
            _this.change();
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
					contacto: _this.resumenParaEnviar()
				}
			});
			
			// lo agrego
			Contactos.agregar(mensaje.datoSeguro.contacto);
		});
		
        vx.when({
            tipoDeMensaje: "Traders.altaDeProducto",
            idOwner: this.id            
        }, function(mensaje){	
            _this.altas.push(mensaje.alta);            
            var producto = _this._agregarProducto(mensaje.alta);       
            _this.change();
            _this.onProductoAgregado(producto);
        });
        
		this.change(function(){
			Persistidor.set(_this.id, _this.resumenParaGuardar());
		});
		this.change();
	},
    inventario: function(filtro){
        if(!filtro) return this._inventario;
        return _.findWhere(this._inventario, filtro);
    },
	crearProducto: function(valorInicial){   
        valorInicial.id = this.nextProductoId();
        var alta = {
            documento: "Traders.altaDeProducto",
            idOwner: this.id,
            valorInicial: valorInicial
        };
        
		vx.send({
			tipoDeMensaje:"Traders.altaDeProducto",
			idOwner: this.id,
            alta: Encriptador.encriptarString(JSON.stringify(alta), this.claveLectura, this.id)            
		});
    },
    _agregarProducto: function(alta){
		var _this = this;
        var producto = new Producto(alta, this.id, this.claveLectura);
		this._inventario.push(producto);		        
		producto.alEliminar(function(){
			_this.quitarProducto(producto);
		});
        return producto;
    },
    _quitarProducto: function(p){
        this._inventario = $.grep(this._inventario, function(prod){
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
		
		_.each(this._inventario, function(producto){
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
            this._onProductoAgregado.disparar(arguments[0]);
        }		
    },
    onProductoQuitado: function(){
        var _this = this;
        if(!this._onProductoQuitado) this._onProductoQuitado = new Evento();
        if(_.isFunction(arguments[0])){		
            return this._onProductoQuitado.addHandler(arguments[0]);			
        }else{
            this._onProductoQuitado.disparar(arguments[0]);
        }		
    },    
    change: function(){
        var _this = this;
        if(!this._change) this._change = new Evento();
        if(_.isFunction(arguments[0])){		
            return this._change.addHandler(arguments[0]);			
        }else{
            this._change.disparar(arguments[0]);
        }		
    },
    resumenParaGuardar: function(){
        return {			
            nombre: this.nombre,
            avatar: this.avatar,
			altas: this.altas
        }
    },
	resumenParaEnviar: function(){
        var resumen = this.resumenParaGuardar();
        resumen.id = this.id;
        return resumen;
    }
};