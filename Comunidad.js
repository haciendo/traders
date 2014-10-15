var Comunidad = co = {
    start: function(id_usuario){
        this.idUsuario = id_usuario;
        this.contactos = this.find({
            tipo: "SolicitudDeAmistad", 
            estado: "Aprobada"});
    },
    find: function(filtro){        
        return new PedidoDeObjetosComunitarios(filtro);
    }
};