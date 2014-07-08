/*
Vortex by Vortex Group is licensed under a Creative Commons Reconocimiento 3.0 Unported License.
To view a copy of this licence, visit: http://creativecommons.org/licenses/by/3.0/
Project URL: https://sourceforge.net/p/vortexnet
*/


if(typeof(require) != "undefined"){
    var NodoRouter = require("./NodoRouter").clase;
    //var NodoClienteHTTP = require("./NodoClienteHTTP").clase;
    var NodoConectorSocket = require("./NodoConectorSocket").clase;
    var NodoPortalBidi = require("./NodoPortalBidi").clase;
    var cryptico = require("cryptico");
    var io = require('socket.io-client');
    
    exports.GeneradorDeIdMensaje = require("./GeneradorDeIdMensaje").clase;
    exports.ClonadorDeObjetos = require("./ClonadorDeObjetos").clase;
    exports.PataConectora = require("./PataConectora").clase;
    exports.FiltrosYTransformaciones = require("./FiltrosYTransformaciones");
    exports.NodoMultiplexor = require("./NodoMultiplexor").clase;
    exports.NodoRouter = NodoRouter;
    exports.NodoPortalBidi = NodoPortalBidi;
    exports.NodoPortalBidiMonoFiltro = require("./NodoPortalBidiMonoFiltro").clase;
    exports.NodoConectorSocket = NodoConectorSocket;    
    //exports.NodoClienteHTTP = NodoClienteHTTP;    
    exports.NodoConectorHttpServer = require("./NodoConectorHttpServer").clase;   
}


var Vortex = Vx = vX = vx = {
    start:function(opt){
        this.verbose = opt.verbose;
        this.router = new NodoRouter();
		Encriptador.start();
        this.portalesEntrada = [];

		this.portalSalida = new PortalSeguro();
		this.lastRequest = 0;
		this.conexion_web;
    },
    conectarPorHTTP: function(p){
		if(this.conexion_web){
			this.conexion_web.alDesconectar = function(){};
			this.conexion_web.desconectarDe(this.router);
			this.adaptadorWebSockets = {};
		}
        var _this = this;
        p.verbose = this.verbose;
        p.alDesconectar = function(){
            _this.conectarPorHTTP(p);
        }
        this.adaptadorHTTP = new NodoClienteHTTP(p);
        this.router.conectarBidireccionalmenteCon(this.adaptadorHTTP);
		
		this.conexion_web = this.adaptadorHTTP;
    },
    conectarPorWebSockets: function(p){
		if(this.conexion_web){
			this.conexion_web.alDesconectar = function(){};
			this.conexion_web.desconectarDe(this.router);
			this.adaptadorHTTP = {};
		}
        var _this = this;
        var socket = io.connect(p.url);    
        this.adaptadorWebSockets = new NodoConectorSocket({
            id: "1",
            socket: socket, 
            verbose: this.verbose, 
            alDesconectar:function(){
                _this.conectarPorWebSockets(p);
            }
        });    
        this.router.conectarBidireccionalmenteCon(this.adaptadorWebSockets);
		this.conexion_web = this.adaptadorWebSockets;
    },
    conectarPorBluetoothConArduino: function(p){
        this.adaptadorArduino = new NodoAdaptadorBluetoothArduino(p);
        this.router.conectarBidireccionalmenteCon(this.adaptadorArduino);
    },
    pedirMensajes: function(p){
        var filtro = p.filtro;
        if(p.filtro.evaluarMensaje === undefined) filtro = new FiltroXEjemplo(p.filtro);    //si no tiene el método evaluarMensaje, no es un filtro. creo uno usando ese objeto como ejemplo
        var portal = new NodoPortalBidi("portal" + this.portalesEntrada.length);
        portal.conectarBidireccionalmenteCon(this.router);        
        portal.pedirMensajes(filtro, p.callback); 
        this.portalesEntrada.push(portal);
        return this.portalesEntrada.length - 1; //devuelvo id del portal/pedido para que el cliente pueda darlos de baja
    },
    pedirMensajesSeguros: function(p, desencriptarCon){
        var _this = this;
		
		
        return this.pedirMensajes({
            filtro:p.filtro,
            callback: function(mensaje){
				
				var mi_clave = Encriptador.claveAnonima;
				var su_clave = Encriptador.claveAnonima;
				
				if(mensaje.para) mi_clave = desencriptarCon;
				if(mensaje.de) su_clave = mensaje.de;				
				
				if(mensaje.datoSeguro){					
					var dato_desencriptado = Encriptador.desEncriptarString(mensaje.datoSeguro, su_clave, mi_clave);
					if(dato_desencriptado === undefined) return;
					mensaje.datoSeguro = JSON.parse(dato_desencriptado);
					p.callback(mensaje);					
				} else {
					p.callback(mensaje);
				}
            }
        });
    },
    enviarMensaje:function(mensaje){
        this.router.recibirMensaje(mensaje);
    },
    enviarMensajeSeguro:function(mensaje, firmarCon){
        //var mi_clave_privada = undefined;
        var mi_clave = Encriptador.claveAnonima;
        var su_clave = Encriptador.claveAnonima;
        if(mensaje.de) mi_clave = firmarCon;
        if(mensaje.para) su_clave = mensaje.para;
		
		if(mensaje.datoSeguro){
			mensaje.datoSeguro = Encriptador.encriptarString(JSON.stringify(mensaje.datoSeguro), su_clave, mi_clave);
		}
        
        this.router.recibirMensaje(mensaje);
    },
//	send: function(){
//		this.portalSalida.send(arguments);
//	},
	send: function(){		
		var _this = this;
		var obj = null;	
		
		var callback = null;
		var claveRSA = null;		
		obj = arguments[0];
		
		if(arguments.length==2){
			callback = arguments[1];
		}
		
		if(callback && obj.de){
			
			obj.idRequest = ++this.lastRequest;
			
			var idPortal = this.when({
				responseTo: obj.idRequest,
				para: obj.de
			},function(objRespuesta){
				callback(objRespuesta);
				_this.portalesEntrada.splice(idPortal, 1);
			});
		}
		
		if(obj.de){
			this.enviarMensajeSeguro(obj, obj.de);
			return;
		}
		
		if(!obj.de && obj.para){
			this.enviarMensajeSeguro(obj);
			return;
		}
		
		this.enviarMensaje(obj);		
	},
//    when: function(){
//        var portal = new PortalSeguro();
//        this.portalesEntrada.push(portal);
//        
//        var filtro;
//        var callback; 
//        if(arguments.length == 2){
//            filtro = arguments[0];
//            callback = arguments[1];
//        }
//        if(arguments.length == 1){
//            filtro = arguments[0].filtro;
//            callback = arguments[0].callback;
//        }	
//        portal.when(filtro, callback);
//    },
	when: function(){		
		var _filtro = arguments[0];
		var _callback = arguments[1];
		
		if(_filtro.para){
			return this.pedirMensajesSeguros({
				filtro: _filtro,
				callback: _callback
			}, _filtro.para);
		}
		
		if(_filtro.de && !_filtro.para){
			return this.pedirMensajesSeguros({
				filtro: _filtro,
				callback: _callback
			});			
		}

		return this.pedirMensajes({
			filtro: _filtro,
			callback: _callback
		});
	}
};

if(typeof(require) != "undefined"){
    exports.Vortex = Vortex;
}