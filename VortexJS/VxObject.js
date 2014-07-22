var VxObject = function(opt){
	var _this = this;
	this._change_callbacks = [];
	this.strValor = new VxString(opt);
	this.strValor.change(function(){
		_this.change();
	});
};

VxObject.prototype.val = function(valor){
	var _this = this;
	if(valor === undefined){ 
		var val = this.strValor.val();
		if(val) return JSON.parse(this.strValor.val());
		else return undefined;
  	};
	this.strValor.val(JSON.stringify(valor));
};

VxObject.prototype.valorEncriptado = function(valor_encriptado){
	if(valor_encriptado === undefined){ 
		return this.strValor.valorEncriptado();
  	};
	this.strValor.valorEncriptado(valor_encriptado);
}

VxObject.prototype.change = function(callback){
	var _this = this;
	if(callback){		
		this._change_callbacks.push(callback);			
	}else{
		_.each(this._change_callbacks, function(evento){
			evento();
		});
	}
};