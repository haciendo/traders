"use strict";
$(function() {  
    //toda esta garcha es para detectar si la aplicacion esta corriendo en un celular o en una pc.
    //En el celular para arrancar la app hay que esperar al evento deviceReady, en la pc solo al documentReady
    window.isphone = false;
	window.isphone = (document.URL.indexOf("com.haciendo.traders") > 0);
	
	
	if(window.isphone){
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
});


var onDeviceReady = function() {     
    vx.start({verbose:false});
    
	// url:'http://router-vortex.herokuapp.com',
	// url:'http://localhost:3000',
	vx.conectarPorWebSockets({
		url:"https://router-vortex.herokuapp.com"
	}); 
	
    PantallaInicio.start();
    PantallaInicio.render();
	
	vex.defaultOptions.className = 'vex-theme-top';
	/**
	 * Enables the background mode. The app will not pause while in background.
	 */
	if(window.plugin){
		window.plugin.backgroundMode.enable();
	}
};




