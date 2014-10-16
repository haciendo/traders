var BuscadorEnContactos = BC = {
    start: function(id_usuario){
        this.idUsuario = id_usuario;
        this.contactos = this.buscar({
            tipo: "SolicitudDeAmistad", 
            estado: "Aprobada"});
    },
    buscar: function(filtro){      	
        return new BusquedaEnContactos(filtro);
    }
};