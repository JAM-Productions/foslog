---
title: "Foslog v0.3.0 - La Actualización de Contenido"
date: "2025-12-01"
category: "releases"
description: "Esta actualización masiva trae una gran cantidad de nuevas características, incluyendo un sistema completo de reseñas, paginación, páginas legales y mejoras significativas en la interfaz de usuario."
---

# Presentamos Foslog v0.3.0

Estamos encantados de presentar **Foslog v0.3.0**, un lanzamiento histórico repleto de nuevas características y mejoras que profundizan la experiencia del usuario. Esta actualización introduce un sistema completo de reseñas, una navegación mejorada con paginación y documentos legales importantes, junto con numerosas mejoras de interfaz de usuario y rendimiento.

## Novedades

### Características Principales
- **Sistema Completo de Reseñas**: Ahora puedes añadir, ver y dar "me gusta" a las reseñas de cualquier elemento multimedia. Un nuevo modal de reseñas y páginas dedicadas a las reseñas hacen que compartir tu opinión sea muy fácil.
- **Paginación**: Hemos añadido paginación a la página de inicio y a las reseñas en las páginas de medios, facilitando la navegación por grandes colecciones de contenido.
- **Páginas Legales**: Hemos implementado páginas de Política de Privacidad y Términos de Servicio para garantizar la transparencia y la confianza.
- **Pie de Página en Todo el Sitio**: Se ha añadido un nuevo pie de página que proporciona un acceso fácil a los documentos legales y otros enlaces importantes.
- **Mejoras en la Página de Medios**: Las páginas de medios ahora incluyen esqueletos para una experiencia de carga más fluida, un formulario para publicar reseñas directamente y muestran los géneros asociados.

### Mejoras en UI/UX
- **No Más Parpadeo del Tema**: Hemos solucionado el molesto parpadeo del tema que ocurría al cargar la página.
- **Cabecera Más Inteligente**: La cabecera ahora es plegable y por defecto está en estado plegado para un aspecto más limpio. El logotipo de Foslog también enlaza a la página de inicio.
- **Actualización de Iconos**: Hemos reemplazado los emojis por iconos nítidos de `lucide-react` en el filtro de tipo de medio para una sensación más profesional.
- **Modales Mejorados**: El modal de reseñas ahora funciona mejor en dispositivos móviles y hemos solucionado un fallo visual donde los menús desplegables podían cortarse.
- **Mejor Manejo de Imágenes**: Hemos reemplazado las etiquetas `<img>` por el componente `<Image>` de Next.js para una carga de imágenes optimizada.

### API y Rendimiento
- **Calificaciones Más Inteligentes**: El sistema para calcular las calificaciones promedio y el número total de reseñas se ha optimizado para un mejor rendimiento.
- **Manejo de Errores Mejorado**: Hemos implementado un sistema de manejo de errores de API más robusto para una mayor estabilidad.
- **Correcciones de CORS y Autenticación**: Hemos hecho nuestra política de CORS más flexible y hemos resuelto varios problemas de autenticación relacionados con los despliegues de Vercel.
- **Datos Reales**: Las páginas de inicio y de medios ahora cargan datos reales y no simulados, dando vida a la plataforma.

## Changelog Completo

Para una lista detallada de todos los cambios, puedes ver el [changelog completo en GitHub](https://github.com/JAM-Productions/foslog/compare/v0.2.0...v0.3.0).

## Colaboradores

Este lanzamiento no habría sido posible sin el arduo trabajo de nuestros increíbles colaboradores:

- @jorbush
- @mriverre8
- @google-labs-jules
- @dependabot

---

*¿Tienes comentarios o sugerencias? Nos encantaría saber de ti en jamproductionsdev@gmail.com*
