/*
Vortex by Vortex Group is licensed under a Creative Commons Reconocimiento 3.0 Unported License.
To view a copy of this licence, visit: http://creativecommons.org/licenses/by/3.0/
Project URL: https://sourceforge.net/p/vortexnet
*/

if(typeof(require) != "undefined"){
    var GeneradorDeIdMensaje = require("./GeneradorDeIdMensaje").clase;
    var PataConectora = require("./PataConectora").clase;
    var FiltroOR = require("./FiltrosYTransformaciones").FiltroOR;
    var FiltroAND = require("./FiltrosYTransformaciones").FiltroAND;
}

var NodoPortalBidi = function(aliasPortal){
    this._listaPedidos = [];
    this._pata = new PataConectora(0, new GeneradorDeIdMensaje());
    this._alias_portal = "portal " + aliasPortal;
	this._ultimo_id_pedido = 0;
};

NodoPortalBidi.prototype.publicarFiltros = function(){
    var filtros = [];
    this._listaPedidos.forEach(function(p){
        filtros.push(p.filtro);
    });
    var filtroMergeado = new FiltroOR(filtros).simplificar();
    this._pata.publicarFiltro(filtroMergeado);
};

NodoPortalBidi.prototype.enviarMensaje = function(un_mensaje){
    this._pata.recibirMensaje(un_mensaje);
 	this._listaPedidos.forEach(function(p){
        if(!p.atenderMensajesPropios) return;
		if(p.filtro.evaluarMensaje(un_mensaje)) p.callback(ClonadorDeObjetos.clonarObjeto(un_mensaje));
    });
};

NodoPortalBidi.prototype.pedirMensajes = function(){
	var opt = getArguments(arguments, {
		filtro:{},
		callback: function(){},
		atenderMensajesPropios: false
	});
	
	if(opt.filtro.evaluarMensaje === undefined) opt.filtro = new FiltroXEjemplo(opt.filtro);    //si no tiene el método evaluarMensaje, no es un filtro. creo uno usando ese objeto como ejemplo
    
	var pedido = { 
		id: ++this._ultimo_id_pedido,
		filtro: opt.filtro, 
		callback: opt.callback,
		atenderMensajesPropios: opt.atenderMensajesPropios
	};
	
    this._listaPedidos.push(pedido);
    this.publicarFiltros();
	return pedido.id;
};

NodoPortalBidi.prototype.quitarPedido = function(id_pedido){
	var index_pedido;
	this._listaPedidos.forEach(function(pedido, index){
        if(pedido.id == id_pedido) index_pedido = index; 
    });
	this._listaPedidos.splice(index_pedido, 1);
	this.publicarFiltros();
};

NodoPortalBidi.prototype.recibirMensaje = function(un_mensaje) {
    //console.log('mensaje recibido en ' + this._alias_portal, un_mensaje);
    if(un_mensaje.tipoDeMensaje !== undefined){
		if(un_mensaje.tipoDeMensaje.slice(0, "Vortex.".length) == "Vortex."){
			this._pata.recibirMensaje(un_mensaje);
			return;
		}
	}
    this._listaPedidos.forEach(function (pedido) {					
        if(pedido.filtro.evaluarMensaje(un_mensaje)){
            pedido.callback(ClonadorDeObjetos.clonarObjeto(un_mensaje));
        }
    });	        
};

NodoPortalBidi.prototype.conectarCon = function(un_receptor){
    //this.publicarFiltros();
    this._pata.conectarCon(un_receptor);
};

NodoPortalBidi.prototype.conectarBidireccionalmenteCon = function (otro_nodo) {
    this.conectarCon(otro_nodo);
    otro_nodo.conectarCon(this);
};

NodoPortalBidi.prototype.conectadoBidireccionalmente = function(){
    return this._pata.conectadaBidireccionalmente();
};

NodoPortalBidi.prototype.filtroDeSalida = function(){
    return this._pata.filtroRecibido();
};

NodoPortalBidi.prototype.desconectar = function(){
	if(!this._pata._receptor) return;
	this._pata._receptor.desconectarDe(this)
	this._pata.desconectar();
};

NodoPortalBidi.prototype.desconectarDe = function(un_nodo){
	this.desconectar();
};


if(typeof(require) != "undefined"){ exports.clase = NodoPortalBidi;}