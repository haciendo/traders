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
	encriptarString: function(texto, encriptarCon, firmarCon){
		return cryptico.encrypt(texto, encriptarCon, this.keys[firmarCon]).cipher;
	},
	encriptarObjeto: function(objeto, encriptarCon, firmarCon){
        var _this = this;
        var objeto_encriptado = {};
        for (var nombre_prop in objeto) {
            if (objeto.hasOwnProperty(nombre_prop)) {
                //var nombre_prop_encriptado = _this.encriptarString(nombre_prop, rsa_publica, rsa_privada);
                if (typeof objeto[nombre_prop] == "object")
                    objeto_encriptado[nombre_prop] = _this.encriptarObjeto(objeto[nombre_prop], encriptarCon, firmarCon);
                else
                    objeto_encriptado[nombre_prop] = _this.encriptarString(objeto[nombre_prop], encriptarCon, firmarCon);
            }
        }
        return objeto_encriptado;
	},
	desEncriptarString: function(texto_encriptado, validarCon, desencriptarCon){
		var desencriptado = cryptico.decrypt(texto_encriptado, this.keys[desencriptarCon]);
		if(desencriptado.status == "success"){
			if(desencriptado.signature == "verified"){
				if(validarCon == desencriptado.publicKeyString){
					return desencriptado.plaintext;
				}
			}
			console.log("error al validar la firma");
		}
		console.log("error al desencriptar");
	},
	desEncriptarObjeto: function(objeto_encriptado, validarCon, desencriptarCon){
        var _this = this;
        var objeto = {};
        for (var nombre_prop in objeto_encriptado) {
            if (objeto_encriptado.hasOwnProperty(nombre_prop)) {
                //var nombre_prop = _this.desEncriptarString(nombre_prop_encriptado, rsa_publica, rsa_privada);
                if (typeof objeto_encriptado[nombre_prop] == "object")
                    objeto[nombre_prop] = _this.desEncriptarObjeto(objeto_encriptado[nombre_prop], validarCon, desencriptarCon);
                else
                    objeto[nombre_prop] = _this.desEncriptarString(objeto_encriptado[nombre_prop], validarCon, desencriptarCon);
            }
        }
        return objeto;
	},
	tengoClavePrivadaDe: function(clave_publica){
		return this.keys[clave_publica] !== undefined;
	}
};