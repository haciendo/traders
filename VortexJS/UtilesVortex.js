/*
Vortex by Vortex Group is licensed under a Creative Commons Reconocimiento 3.0 Unported License.
To view a copy of this licence, visit: http://creativecommons.org/licenses/by/3.0/
Project URL: https://sourceforge.net/p/vortexnet
*/

function getIdObjeto() {
    return Math.floor((Math.random() * 1000000) + 1).toString();
}

var compararIdsMensajes = function(id1, id2){
	if(id1===undefined || id2 ===undefined) return false;
	return id1.id_del_emisor == id2.id_del_emisor && id1.numero_secuencia == id2.numero_secuencia;
}

var Persistidor = function(divPersistencia){
	var $divPersistencia = $(divPersistencia);
	this.divPers = $divPersistencia; //BORRAR!!!!
	this.setValor = function(nombreValor, valor){
		obtenerDivPersistencia($divPersistencia, nombreValor).text(valor);
	};
	this.getValor = function(nombreValor){
		return obtenerDivPersistencia($divPersistencia, nombreValor).text();
	};	
	this.getSubPersistidor = function(idPersistidor){
		return new Persistidor(obtenerDivPersistencia($divPersistencia, idPersistidor));
	};
	this.getSubPersistidores = function(){
		var listaPersistidores = [];
		$.each($divPersistencia.children(), function (clave, dp) {
	        listaPersistidores.push(new Persistidor(dp));
    	});
		return listaPersistidores;
	}
	this.quitarValor = function(nombreValor){
		obtenerDivPersistencia($divPersistencia, nombreValor).remove();
	};
	this.serializar = function(){
		return $divPersistencia.html();
	};
	this.desSerializar = function(nuevoEstado){
		// var divEstadoActual = $("<div/>").html($divPersistencia.html());
		// var divEstadoNuevo = $("<div/>").html(nuevoEstado);
		// $.extend(divEstadoActual, divEstadoNuevo);
		// $divPersistencia.html(divEstadoActual.html());
		this.mergearCon(nuevoEstado);
	};
	this.mergearCon = function(nuevoEstado){
		var divEstadoActual = $("<div/>").html($divPersistencia.html());
		var divEstadoNuevo = $("<div/>").html(nuevoEstado);
		mergear2elementos(divEstadoActual, divEstadoNuevo);
		$divPersistencia.html(divEstadoActual.html());
	};
	var mergear2elementos = function(e1, e2){
		if(e2.children().size()>0){
			$.each(e2.children(),  function(index, value) { 
				$value = $(value);
				if(e1.children("#" + $value.attr('id')).size()>0) mergear2elementos(e1.children("#" + $value.attr('id')), $value);
				else e1.append($value);
			});}
		else{
			e1.text(e2.text());
		}
	};
};

var Parametro = function(clave, valor){
	this.clave = clave;
	this.valor = valor;
};

var ConjuntoVortex = function(portal){	
	var filtrosEntrada = [];
	var transformacionesSalida = [];
	
	this.agregarFiltroEntrada = function(filtro){
		filtrosEntrada.push(filtro);
	};	
	this.agregarTrafoSalida = function(trafo){
		transformacionesSalida.push(trafo);
	};	
	this.recibirMensaje = function(mensaje) {
		transformacionesSalida.forEach(function(t){t.transformarMensaje(mensaje);});
		portal.enviarMensaje(mensaje);
	};	
	this.pedirMensajes = function(callback){
		this.pedirMensajesPasandoFiltros([], callback);
	};	
	this.pedirMensajesPasandoFiltros = function(filtros, callback){
		var filtrosAPasar = [];
		filtrosEntrada.forEach(function(f){filtrosAPasar.push(f);});
		filtros.forEach(function(f){filtrosAPasar.push(f);});
		portal.pedirMensajes(new FiltroAND(filtrosAPasar), callback);
	};	
	this.getSubConjunto = function(){
		return new SubConjuntoVortex(this);
	};
};

var SubConjuntoVortex = function(superConjunto){	
	var filtrosEntrada = [];
	var transformacionesSalida = [];
	
	this.agregarFiltroEntrada = function(filtro){
		filtrosEntrada.push(filtro);
	};	
	this.agregarTrafoSalida = function(trafo){
		transformacionesSalida.push(trafo);
	};	
	this.recibirMensaje = function(mensaje) {
		transformacionesSalida.forEach(function(t){t.transformarMensaje(mensaje);});
		superConjunto.recibirMensaje(mensaje);
	};	
	this.pedirMensajes = function(callback){
		this.pedirMensajesPasandoFiltros([], callback);
	};	
	this.pedirMensajesPasandoFiltros = function(filtros, callback){
		var filtrosAPasar = [];
		filtrosEntrada.forEach(function(f){filtrosAPasar.push(f);});
		filtros.forEach(function(f){filtrosAPasar.push(f);});
		superConjunto.pedirMensajesPasandoFiltros(filtrosAPasar, callback);
	};	
	this.getSubConjunto = function(){
		return new SubConjuntoVortex(this);
	};
};

var ContextoVortex = function(contextoSuperior){
	this.setParametro = function(clave, valor){
		if(contextoSuperior.getParametro(clave)===undefined){
			this[clave]=valor;
		}
		else{
			contextoSuperior.setParametro(clave, valor);
		}
	};
	this.getParametro = function(clave){
		var valorCtxSuperior = contextoSuperior.getParametro(clave);
		if(valorCtxSuperior===undefined){
			return this[clave];
		}
		else{
			return valorCtxSuperior;
		}
	};
	this.getSubContexto = function(){
		return new ContextoVortex(this);		
	};
};

var ContextoNulo= function(){
	this.setParametro = function(clave, valor){};
	this.getParametro = function(clave){ return undefined;};
	this.getSubContexto = function(){
		return new ContextoVortex(this);		
	};
};

function obtenerDivPersistencia(contenedor, id){
	var divPersistencia = contenedor.find("#" + id);
	if(divPersistencia.size() == 0){
		divPersistencia = $('<div></div>');
        //divPersistencia.attr('id', "P_" + id);
        divPersistencia.attr('id', id);
        contenedor.append(divPersistencia);
	}
	return divPersistencia;
}


var ComparadorDeObjetos = {
    comparar: function(o1, o2){
        var p;
        for(p in o1) {
          if(typeof(o2[p])=='undefined') {return false;}
        }
        
        for(p in o1) {
          if (o1[p]) {
              switch(typeof(o1[p])) {
                  case 'object':
                      if (!o1[p].equals(o2[p])) { return false; } break;
                  case 'function':
                      if (typeof(o2[p])=='undefined' ||
                          (p != 'esIgualA' && o1[p].toString() != o2[p].toString()))
                          return false;
                      break;
                  default:
                      if (o1[p] != o2[p]) { return false; }
              }
          } else {
              if (o2[p])
                  return false;
          }
        }
        
        for(p in o2) {
          if(typeof(o1[p])=='undefined') {return false;}
        }
        
        return true;
    }
};

var getArguments = function(argumentos, defaults){
	// si tengo un solo argumento podría ser un objeto con todos los argumentos en sus claves
	if(argumentos.length == 1){
		// para ser así deberían estar contenidas todas sus claves en el objeto defaults
		if(_.isObject(argumentos[0])){
			if(_.difference(_.keys(argumentos[0]), _.keys(defaults)).length == 0){
				return _.extend({}, defaults, argumentos[0]);
			}
		}		
	} 
	// si tengo varios argumentos o uno solo pero con claves no contenidas en los defaults
	// devuelvo los argumentos pisando a los defaults
	var obj_args = {};
	obj_args = _.extend(obj_args, defaults);
	_.each(argumentos, function(arg, index){
		obj_args[_.keys(defaults)[index]] = arg;
	});
	return obj_args;
};

var randomString = function (length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}