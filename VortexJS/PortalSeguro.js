var PortalSeguro = function(id){
	this.portal = new NodoPortalBidi();
	vx.router.conectarBidireccionalmenteCon(this.portal);
};

PortalSeguro.prototype.send = function(mensaje){
	
};

PortalSeguro.prototype.when = function(p){
 	var filtro = p.filtro;
	if(p.filtro.evaluarMensaje === undefined) filtro = new FiltroXEjemplo(p.filtro);    //si no tiene el método evaluarMensaje, no es un filtro. creo uno usando ese objeto como ejemplo
        
	this.portal.pedirMensajes(filtro, p.callback); 
};