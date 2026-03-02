---
title: "Foslog v0.5.0 - La Actualización de Comunidad y Refinamiento"
date: "2026-03-02"
category: "releases"
description: "La versión 0.5.0 ya está aquí, introduciendo funciones sociales con el nuevo sistema de seguidores, edición de reseñas, valoraciones de media estrella y optimizaciones de rendimiento con triggers de base de datos."
---

# Presentamos Foslog v0.5.0

¡Estamos emocionados de anunciar el lanzamiento de **Foslog v0.5.0**! Esta actualización se centra en profundizar la experiencia de la comunidad y refinar las funciones principales que utilizas cada día. Desde el sistema de seguidores tan solicitado hasta la precisión de las valoraciones de media estrella y los masivos beneficios de rendimiento internos, la v0.5.0 hace que Foslog sea más rápida, más social y más precisa.

## Qué hay de nuevo

### Comunidad y Social
- **Sistema de Seguidores**: ¡Ahora puedes seguir y dejar de seguir a otros usuarios! Mantén un seguimiento de tus reseñadores favoritos y mira su última actividad. También hemos añadido un nuevo Modal de Seguidores para gestionar fácilmente tus conexiones.
- **Edición y Eliminación de Reseñas**: ¿Hiciste una falta de ortografía o cambiaste de opinión? Ahora puedes editar o eliminar tus reseñas existentes.
- **Gestión de Comentarios**: Ahora tienes la capacidad de eliminar comentarios de una reseña, dándote más control sobre las discusiones en tus publicaciones.

### Precisión y UI
- **Reseñas de Media Estrella**: A veces 4 estrellas no son suficientes, pero 5 son demasiadas. Ahora puedes valorar contenido con una precisión de media estrella.
- **Nuevo Carrusel de Estadísticas**: Hemos implementado un nuevo carrusel elegante para las tarjetas de estadísticas en pantallas pequeñas, haciendo que sea más fácil digerir tus datos desde cualquier lugar.
- **Correcciones en la Experiencia Móvil**: Hemos estandarizado las alturas de las tarjetas y hemos corregido el molesto problema del zoom en los formularios móviles aumentando el tamaño de la fuente en las entradas pequeñas.
- **Refinamientos Visuales**: Busca el nuevo logotipo de JAM en el pie de página y la interfaz de las tarjetas de medios mejorada para un aspecto más pulido.

### Rendimiento y Arquitectura
- **Triggers de Base de Datos**: Hemos movido los cálculos estadísticos pesados a los triggers de PostgreSQL. Esto significa que las estadísticas globales y los totales se actualizan de forma instantánea y eficiente en segundo plano.
- **Caché de Redis**: Las estadísticas globales ahora se guardan en la caché con Redis, reduciendo significativamente la carga de la base de datos y acelerando las transiciones de página.
- **Integración con Axiom**: Hemos integrado Axiom para un mejor registro y observabilidad, ayudándonos a detectar y corregir problemas más rápido que nunca.
- **Diagramas de Arquitectura**: Hemos añadido nuevos diagramas de arquitectura y de flujo de trabajo al repositorio para documentar mejor cómo funciona Foslog internamente.

### Usuario y SEO
- **Gestión de la Cuenta**: Ahora puedes eliminar tu cuenta directamente desde el modal de configuración. También hemos mejorado la fiabilidad de las actualizaciones del nombre de usuario y la imagen de perfil.
- **SEO y Metadatos**: Hemos realizado mejoras significativas en nuestra gestión de SEO y metadatos, haciendo que sea más fácil que tus reseñas se encuentren y se compartan en la red.
- **Internacionalización**: Se han añadido más etiquetas localizadas, incluyendo correcciones para las etiquetas "series" vs "serie" en diferentes idiomas.

## Changelog Completo

Para una lista detallada de todos los cambios, puedes ver el [changelog completo en GitHub](https://github.com/JAM-Productions/foslog/compare/v0.4.0...v0.5.0).

## Colaboradores

Un gran agradecimiento a nuestros colaboradores por este lanzamiento:

- @jorbush
- @mriverre8
- @mykytakrasnov (¡Bienvenido a nuestro nuevo colaborador!)
- @Copilot
- @google-labs-jules
- @dependabot

---

*¿Tienes comentarios o sugerencias? Nos encantaría saber de ti en jamproductionsdev@gmail.com*
