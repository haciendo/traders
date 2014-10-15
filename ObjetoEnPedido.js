var ObjetoEnPedido = function(valor_inicial){
    Evento.agregarEventoA(this, "alCargar");
	Evento.agregarEventoA(this, "alEliminar");
	Evento.agregarEventoA(this, "alCambiar");
	Evento.agregarEventoA(this, "alNoExistir");
	Evento.agregarEventoA(this, "alDesconectar");    
};