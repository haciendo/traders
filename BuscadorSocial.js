var BuscadorSocial = BS = {
    start: function(id_usuario){
        this.idUsuario = id_usuario;
        this.contactos = this.buscar({
            idOwner: id_usuario,
            tipo: "Contacto",
            estadoSolicitud: "Aceptada"
        });
    },
    buscar: function(filtro){      	
        return new BusquedaSocial(filtro);
    }
};