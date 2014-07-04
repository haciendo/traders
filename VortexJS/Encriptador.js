var Encriptador = {
	start:function(){
		this.keys = [];
		this.claveAnonima = this.addKey("_CLAVE_USUARIOS_ANONIMOS_");		
	},
	addKey: function(clave){		
		var claveRSA = null;
		if(typeof(clave) == 'object'){
			claveRSA = clave;
		}else if(typeof(clave) == 'string'){
			claveRSA = cryptico.generateRSAKey(clave, 1024);
		}		
		
		var clavePublica = cryptico.publicKeyString(claveRSA);
		this.keys[clavePublica] = claveRSA;
		
		return clavePublica;
	},
	encriptarString: function(texto, rsa_publica, rsa_privada){
		return cryptico.encrypt(texto, rsa_publica, rsa_privada).cipher;
	},
	encriptarRuta: function(ruta, rsa_publica, rsa_privada){
		var _this = this;
		var ruta_encriptada = "";
		_.each(ruta.split('.'), function(clavecita){
			ruta_encriptada += _this.encriptarString(clavecita, rsa_publica, rsa_privada);
			ruta_encriptada += ".";
		});		
		if(ruta_encriptada.length>0) ruta_encriptada = ruta_encriptada.slice(0, - 1);
		return ruta_encriptada;
	},
	encriptarObjeto: function(objeto, rsa_publica, rsa_privada){
        var _this = this;
        var objeto_encriptado = {};
        for (var nombre_prop in objeto) {
            if (objeto.hasOwnProperty(nombre_prop)) {
                //var nombre_prop_encriptado = _this.encriptarString(nombre_prop, rsa_publica, rsa_privada);
                if (typeof objeto[nombre_prop] == "object")
                    objeto_encriptado[nombre_prop] = _this.encriptarObjeto(objeto[nombre_prop], rsa_publica, rsa_privada);
                else
                    objeto_encriptado[nombre_prop] = _this.encriptarString(objeto[nombre_prop], rsa_publica, rsa_privada);
            }
        }
        return objeto_encriptado;
	},
	desEncriptarString: function(texto_encriptado, rsa_publica, rsa_privada){
		var desencriptado = cryptico.decrypt(texto_encriptado, rsa_privada);
		if(desencriptado.status == "success"){
			if(desencriptado.signature == "verified"){
				if(rsa_publica == desencriptado.publicKeyString){
					return desencriptado.plaintext;
				}
			}
		}
	},
	desEncriptarRuta: function(ruta_encriptada, rsa_publica, rsa_privada){
		var _this = this;
		var ruta = "";
		_.each(ruta_encriptada.split('.'), function(clavecita){
			ruta += _this.desEncriptarString(clavecita, rsa_publica, rsa_privada);
			ruta += ".";
		});		
		if(ruta.length>0) ruta = clave_encriptada.slice(0, - 1);
		return ruta;
	},
	desEncriptarObjeto: function(objeto_encriptado, rsa_publica, rsa_privada){
        var _this = this;
        var objeto = {};
        for (var nombre_prop in objeto_encriptado) {
            if (objeto_encriptado.hasOwnProperty(nombre_prop)) {
                //var nombre_prop = _this.desEncriptarString(nombre_prop_encriptado, rsa_publica, rsa_privada);
                if (typeof objeto_encriptado[nombre_prop] == "object")
                    objeto[nombre_prop] = _this.desEncriptarObjeto(objeto_encriptado[nombre_prop], rsa_publica, rsa_privada);
                else
                    objeto[nombre_prop] = _this.desEncriptarString(objeto_encriptado[nombre_prop], rsa_publica, rsa_privada);
            }
        }
        return objeto;
	}
};