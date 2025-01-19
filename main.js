//Preentrega 3: Storage/JSON, Eventos, Operadores, librerías (no alerts/prompts)


// Reinicia puntaje y juego
document.getElementById("reiniciarBtn").addEventListener("click", function() {
    puntos = 0;
    localStorage.setItem('puntos', JSON.stringify(puntos));
    traducir();  
});


async function traducir() {
    
    const palabras = [
        { ale: "der Vater", esp: "el padre" },
        { ale: "die Mutter", esp: "la madre" },
        { ale: "der Bruder", esp: "el hermano" },
        { ale: "die Schwester", esp: "la hermana" },
        { ale: "der Onkel", esp: "el tío" },
        { ale: "die Tante", esp: "la tía" },
        { ale: "das Mädchen", esp: "la niña" },
        { ale: "das Kind", esp: "el niño" },
        { ale: "das Baby", esp: "el bebé" },
        { ale: "die Oma", esp: "la abuela" },
        { ale: "der Opa", esp: "el abuelo" }
    ];

    let puntos = 0; // ronda actual 
    let puntosTotales = JSON.parse(localStorage.getItem('puntos')) || 0;

    // Función: obtener palabra aleatoria
    const obtenerPalabraAleatoria = (palabrasFiltradas) => 
        palabrasFiltradas[Math.floor(Math.random() * palabrasFiltradas.length)];

    // Función: filtrar por artículo
    const buscarPorArticulo = (articulo) => palabras.filter(palabra =>
        palabra.ale.toLowerCase().startsWith(articulo.toLowerCase()));


    // Preguntar: buscar por artículo  (SweetAlert2)
    const { value: filtro } = await Swal.fire({
        title: '¿Quieres buscar palabras por su artículo en alemán?',
        input: 'text',
        inputPlaceholder: 'Escribe Sí o No',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
    });

    if (!filtro) {
        return; // Si cancela o no ingresa nada, se detiene el juego
    }

    let palabrasFiltradas = palabras;  // no filtra, usa todas las palabras.

    if (filtro.toLowerCase() === "si" || filtro.toLowerCase() === "sí") {
        palabrasFiltradas = await preguntarArticulo(); // Llama a la función 
    }


    // Función:preguntar el artículo (SweetAlert2)
    async function preguntarArticulo() {
    const { value: articulo } = await Swal.fire({
        title: 'Escribe el artículo (der, die, das) para filtrar las palabras:',
        input: 'text',
        inputPlaceholder: 'Escribe el artículo aquí',
        showCancelButton: false,
        confirmButtonText: 'Aceptar',
    });

    if (!articulo) {
        return palabras; // Si no ingresa nada, no se filtra y se usan todas las palabras
    }
    return buscarPorArticulo(articulo); // palabras filtradas por artículo ingresado
    }

    // Si después de filtrar no escribe un articulo correcto
    if (palabrasFiltradas.length === 0) {
        await Swal.fire({
            icon: 'warning',
            title: 'No se encontraron palabras con ese artículo. Se jugará con todas las palabras.',
            confirmButtonText: 'Aceptar',
        });
        palabrasFiltradas = palabras;  // Si no hay palabras con ese artículo, usar todas las palabras
    }

    let continuar = true;



    // Bucle de juego
    while (continuar && palabrasFiltradas.length > 0) {
        const palabraSeleccionada = obtenerPalabraAleatoria(palabrasFiltradas);
        const { ale: palabraAle, esp: palabraEsp } = palabraSeleccionada; // Desestructuración

        let intentos = 2; 

        // Solicitar traducción (SweetAlert2)
        let respuesta = null;
        while (intentos > 0 && !respuesta) {
            const { value: palabra } = await Swal.fire({
                title: `Traduce "${palabraAle}" al español (Sólo tienes 2 intentos).`,
                input: 'text',
                inputPlaceholder: 'Escribe tu traducción',
                showCancelButton: false,
                confirmButtonText: 'Enviar',
            });

            if (!palabra) {
                await Swal.fire({
                    icon: 'info',
                    title: 'Noch einmal / Intenta de nuevo',
                    confirmButtonText: 'Aceptar',  // si no hay respuesta
                });
                continue; 
            }

            if (palabra.toLowerCase() === palabraEsp.toLowerCase()) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Bien hecho!',
                    confirmButtonText: 'Aceptar',  
                });
                puntos++; 
                respuesta = true; 
            } else {
                intentos--; 
                if (intentos > 0) {
                    await Swal.fire({
                        icon: 'error',
                        title: `¡Incorrecto! Te quedan ${intentos} intento(s).`,  
                        confirmButtonText: 'Intentar de nuevo',
                    });
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: `Has superado el número de intentos. La respuesta correcta es "${palabraEsp}".`,
                        confirmButtonText: 'Aceptar',
                    });
                    respuesta = true;
                }
            }
        }

        
        // Eliminar palabra ya jugada para no repetirla
        const index = palabrasFiltradas.indexOf(palabraSeleccionada);
        if (index !== -1) palabrasFiltradas.splice(index, 1);

        // Preguntar si quiere continuar
        if (palabrasFiltradas.length === 0) {
            await Swal.fire({
                icon: 'info',
                title: '¡Ya no hay más palabras disponibles! Has completado la ronda.',
                confirmButtonText: 'Aceptar',
            });
            continuar = false;
        } else {
            const continuarJuego = await Swal.fire({
                title: '¿Quieres seguir jugando?',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No',
            });
            continuar = continuarJuego.isConfirmed;
        }

        // Guardar puntos acumulados al final de la ronda
        localStorage.setItem('puntos', JSON.stringify(puntosTotales + puntos)); 
    }

    // Mostrar los puntos finales
    await Swal.fire({
        title: `¡Juego Terminado!`,
        text: `Acumulaste ${puntos} puntos en esta ronda. Puntos totales: ${puntosTotales + puntos}.`,
        icon: 'info',
        confirmButtonText: 'Aceptar',
    });
}

traducir();

