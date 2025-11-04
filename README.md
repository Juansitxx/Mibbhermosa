Proyecto: Página interacción romántica

Descripción
------------
Página de presentación interactiva pensada como un detalle para tu novia. Incluye un hero con efecto, galería con lightbox y animaciones (confetti y corazones).

Estructura de archivos
----------------------
- index.html  -> punto de entrada
- assets/css/styles.css -> estilos principales
- assets/js/main.js -> interacciones y animaciones (galería, confetti)
- assets/images/ -> carpeta para tus fotos (coloca aquí tus imágenes)

Añadir música
--------------
- Para añadir una canción de fondo coloca un archivo MP3 dentro de `assets/audio/` y nómbralo `song.mp3` (ruta final: `assets/audio/song.mp3`).
- La página incluye una pantalla inicial negra que solicita que pulses "Entrar"; ese click permite a los navegadores reproducir el audio (política de autoplay).
- También hay un botón en la cabecera para pausar/reanudar la reproducción.

Cómo usar
--------
1. Añade tus fotos (por ejemplo `photo1.jpg`, `photo2.jpg`, ...) dentro de `assets/images/`.
2. Abre `index.html` en tu navegador (doble clic o arrastrar al navegador).
3. Para personalizar los textos, edita directamente `index.html` (titulares y párrafos).

Notas y recomendaciones
-----------------------
- Las imágenes deben tener un tamaño razonable para web (p.ej. 1200px de ancho) para mantener la carga rápida.
- Puedes cambiar la paleta modificando las variables CSS en `assets/css/styles.css`.
- Si quieres más funcionalidades (música de fondo, slideshow automático, mapas de recuerdos), dime y lo añadimos.
