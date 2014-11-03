var BuscadorSocial = BS = {
    start: function(id_usuario){
        this.idUsuario = id_usuario;
        this.contactos = this.buscar({
            idOwner: id_usuario,
            tipo: "SolicitudDeAmistad"});
    },
    buscar: function(filtro){      	
        return new BusquedaSocial(filtro);
    }
};