---
title: "Foslog v0.5.0 - L'Actualització de Comunitat i Refinament"
date: "2026-03-02"
category: "releases"
description: "La versió 0.5.0 ja és aquí, introduint funcions socials amb el nou sistema de seguidors, edició de ressenyes, valoracions de mitja estrella i importants optimitzacions de rendiment amb triggers de base de dades."
---

# Presentem Foslog v0.5.0

Estem emocionats d'anunciar el llançament de **Foslog v0.5.0**! Aquesta actualització se centra en aprofundir l'experiència de la comunitat i refinar les funcions principals que utilitzes cada dia. Des del sistema de seguidors tan sol·licitat fins a la precisió de les valoracions de mitja estrella i els massius guanys de rendiment interns, la v0.5.0 fa que Foslog sigui més ràpida, més social i més precisa.

## Què hi ha de nou

### Comunitat i Social
- **Sistema de Seguidors**: Ara pots seguir i deixar de seguir altres usuaris! Mantingues un seguiment dels teus ressenyadors preferits i mira la seva darrera activitat. També hem afegit un nou Modal de Seguidors per gestionar fàcilment les teves connexions.
- **Edició i Eliminació de Ressenyes**: Has fet una falta d'ortografia o has canviat d'opinió? Ara pots editar o eliminar les teves ressenyes existents.
- **Gestió de Comentaris**: Ara tens la capacitat d'eliminar comentaris d'una ressenya, donant-te més control sobre les discussions en les teves publicacions.

### Precisió i UI
- **Ressenyes de Mitja Estrella**: De vegades 4 estrelles no són suficients, però 5 són massa. Ara pots valorar contingut amb una precisió de mitja estrella.
- **Nou Carrusel d'Estadístiques**: Hem implementat un nou carrusel elegant per a les targetes d'estadístiques en pantalles petites, fent que sigui més fàcil digerir les teves dades des de qualsevol lloc.
- **Correccions en l'Experiència Mòbil**: Hem estandarditzat les altures de les targetes i hem corregit el molest problema del zoom en els formularis mòbils augmentant la mida de la font en les entrades petites.
- **Refinaments Visuals**: Busca el nou logotip de JAM al peu de pàgina i la interfície de les targetes de mitjans millorada per a un aspecte més polit.

### Rendiment i Arquitectura
- **Triggers de Base de Dades**: Hem mogut els càlculs estadístics pesats als triggers de PostgreSQL. Això significa que les estadístiques globals i els totals s'actualitzen de manera instantània i eficient en segon pla.
- **Caché de Redis**: Les estadístiques globals ara es guarden a la caché amb Redis, reduint significativament la càrrega de la base de dades i accelerant les transicions de pàgina.
- **Integració amb Axiom**: Hem integrat Axiom per a una millor monitorització i observabilitat, ajudant-nos a detectar i corregir problemes més ràpid que mai.
- **Diagrames d'Arquitectura**: Hem afegit nous diagrames d'arquitectura i de flux de treball al repositori per documentar millor com funciona Foslog internament.

### Usuari i SEO
- **Gestió del Compte**: Ara pots eliminar el teu compte directament des del modal de configuració. També hem millorat la fiabilitat de les actualitzacions del nom d'usuari i la imatge de perfil.
- **SEO i Metadades**: Hem realitzat millores significatives en la nostra gestió de SEO i metadades, fent que sigui més fàcil que les teves ressenyes es trobin i es comparteixin a la xarxa.
- **Internacionalització**: S'han afegit més etiquetes localitzades, incloent-hi correccions per a les etiquetes "sèries" vs "sèrie" en diferents idiomes.

## Changelog Complet

Per a una llista detallada de tots els canvis, pots veure el [changelog complet a GitHub](https://github.com/JAM-Productions/foslog/compare/v0.4.0...v0.5.0).

## Col·laboradors

Un gran agraïment als nostres col·laboradors per aquest llançament:

- @jorbush
- @mriverre8
- @mykytakrasnov (Benvingut al nostre nou col·laborador!)
- @Copilot
- @google-labs-jules
- @dependabot

---

*Tens comentaris o suggeriments? Ens encantaria saber de tu a jamproductionsdev@gmail.com*
