var VistaDeUnContactoEnLista = function(opt){
	var _this = this;
	var def = {
		seleccionado: false
	};
	_.extend(this, def, opt);
	
	this.ui = $("#plantillas .contacto_en_lista").clone();

	var btn_eliminar = this.ui.find("#btn_eliminar");

	btn_eliminar.click(function(e){
		_this.contacto.eliminar();
		_this.ui.remove();
	});

	this.ui.click(function(){
		_this.onClick();
	});

	this.seleccionar(this.seleccionado);
	this.contacto.change(function(){
		_this.render();
	});
	this.render();
};

VistaDeUnContactoEnLista.prototype.onClick = function(){
	var _this = this;
	if(!this._onClick) this._onClick = new Evento();
	if(_.isFunction(arguments[0])){		
		return this._onClick.addHandler(arguments[0]);			
	}else{
		this._onClick.disparar(arguments[0]);
	}	
};

VistaDeUnContactoEnLista.prototype.onSelect = function(){
	var _this = this;
	if(!this._onSelect) this._onSelect = new Evento();
	if(_.isFunction(arguments[0])){		
		return this._onSelect.addHandler(arguments[0]);			
	}else{
		this._onSelect.disparar(arguments[0]);
	}	
};
		
VistaDeUnContactoEnLista.prototype.render = function(){
	this.ui.find("#nombre").text(this.contacto.nombre);
	var $avatar = this.ui.find("#avatar");

	if(this.contacto.avatar) $avatar.attr("src", this.contacto.avatar);
	else $avatar.attr("src", "avatar_default.png");
};

VistaDeUnContactoEnLista.prototype.seleccionar = function(estado_seleccion){
	if(estado_seleccion === undefined) estado_seleccion = true;
	this.seleccionado = estado_seleccion;
	if(this.seleccionado) this.ui.addClass("contacto_seleccionado");
	else this.ui.removeClass("contacto_seleccionado");
	if(estado_seleccion) this.onSelect();
};

VistaDeUnContactoEnLista.prototype.dibujarEn = function(un_panel){
	un_panel.append(this.ui);
	this.dibujadoEn = un_panel;
};
