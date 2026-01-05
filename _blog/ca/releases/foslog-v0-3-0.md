---
title: "Foslog v0.3.0 - L'Actualització de Contingut"
date: "2025-12-01"
category: "releases"
description: "Aquesta actualització massiva porta una gran quantitat de noves característiques, incloent-hi un sistema complet de ressenyes, paginació, pàgines legals i millores significatives en la interfície d'usuari."
---

# Presentem Foslog v0.3.0

Estem encantats de presentar **Foslog v0.3.0**, un llançament històric ple de noves característiques i millores que aprofundeixen l'experiència de l'usuari. Aquesta actualització introdueix un sistema complet de ressenyes, una navegació millorada amb paginació i documents legals importants, juntament amb nombroses millores d'interfície d'usuari i rendiment.

## Novetats

### Característiques Principals
- **Sistema Complet de Ressenyes**: Ara pots afegir, veure i donar "m'agrada" a les ressenyes de qualsevol element multimèdia. Un nou modal de ressenyes i pàgines dedicades a les ressenyes fan que compartir la teva opinió sigui molt fàcil.
- **Paginació**: Hem afegit paginació a la pàgina d'inici i a les ressenyes a les pàgines de mitjans, facilitant la navegació per grans col·leccions de contingut.
- **Pàgines Legals**: Hem implementat pàgines de Política de Privacitat i Termes de Servei per a garantir la transparència i la confiança.
- **Peu de Pàgina a Tot el Lloc**: S'ha afegit un nou peu de pàgina que proporciona un accés fàcil als documents legals i altres enllaços importants.
- **Millores a la Pàgina de Mitjans**: Les pàgines de mitjans ara inclouen esquelets per a una experiència de càrrega més fluida, un formulari per a publicar ressenyes directament i mostren els gèneres associats.

### Millores en UI/UX
- **No Més Parpelleig del Tema**: Hem solucionat el molest parpelleig del tema que ocorria en carregar la pàgina.
- **Capçalera Més Intel·ligent**: La capçalera ara és plegable i per defecte està en estat plegat per a un aspecte més net. El logotip de Foslog també enllaça a la pàgina d'inici.
- **Actualització d'Icones**: Hem reemplaçat els emojis per icones nítides de `lucide-react` al filtre de tipus de mitjà per a una sensació més professional.
- **Modals Millorats**: El modal de ressenyes ara funciona millor en dispositius mòbils i hem solucionat un error visual on els menús desplegables podien tallar-se.
- **Millor Gestió d'Imatges**: Hem reemplaçat les etiquetes `<img>` pel component `<Image>` de Next.js per a una càrrega d'imatges optimitzada.

### API i Rendiment
- **Qualificacions Més Intel·ligents**: El sistema per a calcular les qualificacions mitjanes i el nombre total de ressenyes s'ha optimitzat per a un millor rendiment.
- **Gestió d'Errors Millorada**: Hem implementat un sistema de gestió d'errors d'API més robust per a una major estabilitat.
- **Correccions de CORS i Autenticació**: Hem fet la nostra política de CORS més flexible i hem resolt diversos problemes d'autenticació relacionats amb els desplegaments de Vercel.
- **Dades Reals**: Les pàgines d'inici i de mitjans ara carreguen dades reals i no simulades, donant vida a la plataforma.

## Changelog Complet

Per a una llista detallada de tots els canvis, pots veure el [changelog complet a GitHub](https://github.com/JAM-Productions/foslog/compare/v0.2.0...v0.3.0).

## Col·laboradors

Aquest llançament no hauria estat possible sense el treball dur dels nostres increïbles col·laboradors:

- @jorbush
- @mriverre8
- @google-labs-jules
- @dependabot

---

*Tens comentaris o suggeriments? Ens encantaria saber de tu a jamproductionsdev@gmail.com*
