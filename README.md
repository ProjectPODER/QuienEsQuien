# QuienEsQuien.Wiki

[![build status](http://gitlab.rindecuentas.org/equipo-qqw/QuienEsQuienWiki/badges/dev/build.svg)](http://gitlab.rindecuentas.org/equipo-qqw/QuienEsQuienWiki/commits/dev)

QuienEsQuien.Wiki es una aplicación para acumular datos sobre personas organizaciones y contratos en América y alrededores.

## Dev

Si coordina desarrollo en esta repositorio gitlab (disponible dentro de la red local). Ocasionalmente el código si actualiza en [github](https://github.com/ProjectPODER/QuienEsQuien).

### obtén el código

    git clone ssh://git@gitlab.rindecuentas.org:2203/equipo-qqw/QuienEsQuienWiki.git
    cd QuienEsQuienWiki/src

### configura el base de datos

    export MONGO_URL=mongodb://dev.rindecuentas.org/meteor

### ejecuta
    meteor run

### ejecuta como applicación de escritorio

    npm install -g electrify
    electrify

### ejecuta imagen docker

    docker run --rm --net=host -p 80 -e PORT=80 \
      -e ROOT_URL=http://localhost \
      -e MONGO_URL=mongodb://dev.rindecuentas.org/meteor \
      poder/qqw:$version

donde `$version` es el [versión de quienesquien.wiki](https://hub.docker.com/r/poder/qqw/tags/)

## [Staging](http://gitlab.rindecuentas.org/equipo-qqw/QuienEsQuienWiki/wikis/staging)

El versión bajo desarrollo más recién encontraras en nuestra área de ensayo
(`staging area`):

  * https://qqwext.herokuapp.com/

## [Production](http://gitlab.rindecuentas.org/equipo-qqw/QuienEsQuienWiki/wikis/production)

El versión listo para ser consultado por el mundo entera si encuentra en el dominio principal:

  * https://www.quienesquien.wiki
