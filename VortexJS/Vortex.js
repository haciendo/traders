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
		
		this.ultimo_id_portal = 0;
		this._portal = new PortalSeguro(this.ultimo_id_portal.toString());
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
	send: function(mensaje, callback){
		return this._portal.send(mensaje, callback);
	},
    when: function(){
        var opt = getArguments(arguments, {
			filtro:{},
			callback: function(){},
			atenderMensajesPropios: true
		});
        return this._portal.when(opt);
    },
	portal: function(){
		var opt = getArguments(arguments, {
			id: (++this.ultimo_id_portal).toString(),
			firmarCon: Encriptador.claveAnonima,
			encriptarCon: Encriptador.claveAnonima,
			validarCon: Encriptador.claveAnonima,
			desencriptarCon: Encriptador.claveAnonima
		});
		return new PortalSeguro(opt);
	}
//    ,
//	get: function(filtro, opt){
//		if(filtro.id) {
//			return new ObjetoRemotoVortex(filtro.id, filtro.idOwner, opt);
//		}
//		if(filtro.tipo) {
//			return new ColeccionRemotaVortex(filtro, filtro.idOwner, opt);
//		}
//	}
};

if(typeof(require) != "undefined"){
    exports.Vortex = Vortex;
}