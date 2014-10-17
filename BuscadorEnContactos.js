var BuscadorEnContactos = BC = {
    start: function(id_usuario){
        this.idUsuario = id_usuario;
        this.contactos = this.buscar({
            idOwner: id_usuario,
            tipo: "SolicitudDeAmistad", 
            estado: "Aprobada"});
    },
    buscar: function(filtro){      	
        return new BusquedaEnContactos(filtro);
    }
};